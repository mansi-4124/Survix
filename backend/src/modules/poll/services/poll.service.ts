import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  OrganizationMemberStatus,
  PollStatus,
  PollType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { TokenPayload } from 'src/modules/auth/domain/types/token-payload.type';
import { CreatePollDtoRequest } from '../dto/request/create-poll.dto.request';
import { UpdatePollDtoRequest } from '../dto/request/update-poll.dto.request';
import { VotePollDtoRequest } from '../dto/request/vote-poll.dto.request';
import { PollDetailsDtoResponse } from '../dto/response/poll-details.dto.response';
import { PollResultsDtoResponse } from '../dto/response/poll-results.dto.response';
import { PollSummaryDtoResponse } from '../dto/response/poll-summary.dto.response';
import { VotePollDtoResponse } from '../dto/response/vote-poll.dto.response';
import { PollGateway } from '../gateways/poll.gateway';
import { PollRealtimeService } from './poll-realtime.service';

type PollWithQuestions = Prisma.PollGetPayload<{
  include: { questions: { include: { options: true } } };
}>;

@Injectable()
export class PollService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PollService.name);
  private readonly closeTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: PollRealtimeService,
    private readonly pollGateway: PollGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bootstrapPollSchedules();
  }

  onModuleDestroy(): void {
    for (const timeout of this.closeTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.closeTimeouts.clear();
  }

  async createPoll(
    dto: CreatePollDtoRequest,
    user: TokenPayload,
  ): Promise<PollDetailsDtoResponse> {
    await this.assertActiveMembership(dto.organizationId, user.sub);

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : new Date();
    const expiresAt = new Date(dto.expiresAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid poll date values');
    }

    if (expiresAt <= startsAt) {
      throw new BadRequestException('expiresAt must be later than startsAt');
    }

    const normalizedQuestions = this.normalizeQuestions(dto.questions ?? []);
    if (normalizedQuestions.length === 0) {
      throw new BadRequestException('Poll requires at least one question');
    }

    const status = startsAt <= new Date() ? PollStatus.LIVE : PollStatus.DRAFT;

    let created: PollWithQuestions | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = this.generatePollCode();
      try {
        created = await this.prisma.poll.create({
          data: {
            code,
            organizationId: dto.organizationId,
            title: dto.title.trim(),
            description: dto.description?.trim() || null,
            createdBy: user.sub,
            status,
            startsAt,
            expiresAt,
            allowAnonymous: dto.allowAnonymous,
            allowMultipleVotes: dto.allowMultipleVotes,
            showLiveResults: dto.showLiveResults,
            questions: {
              create: normalizedQuestions.map((question, index) => ({
                text: question.text,
                type: question.type,
                order: index,
                options:
                  question.type === PollType.MCQ
                    ? {
                        create: question.options.map((text) => ({ text })),
                      }
                    : undefined,
              })),
            },
          },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: {
                options: { orderBy: { createdAt: 'asc' } },
              },
            },
          },
        });
        break;
      } catch (error) {
        const knownError = error as Prisma.PrismaClientKnownRequestError;
        if (knownError.code !== 'P2002') {
          throw error;
        }
      }
    }

    if (!created) {
      throw new ConflictException('Could not generate unique poll code');
    }

    await this.realtimeService.initializePollCounters(
      created.id,
      created.questions.map((question) => ({
        questionId: question.id,
        optionIds: question.options.map((option) => option.id),
      })),
      true,
    );

    if (created.status === PollStatus.LIVE) {
      this.schedulePollClosure(created.id, created.expiresAt);
    }

    return this.toPollDetailsResponse(created);
  }

  async listMyPolls(
    userId: string,
    organizationId?: string,
  ): Promise<PollSummaryDtoResponse[]> {
    const polls = await this.prisma.poll.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        organization: {
          members: {
            some: {
              userId,
              status: OrganizationMemberStatus.ACTIVE,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return polls.map((poll) => ({
      id: poll.id,
      code: poll.code ?? this.toLegacyPollCode(poll.id),
      organizationId: poll.organizationId,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      isActive: this.isPollActuallyActive(
        poll.status,
        poll.startsAt,
        poll.expiresAt,
      ),
      expiresAt: poll.expiresAt,
      totalVotes: poll._count.votes,
      createdAt: poll.createdAt,
    }));
  }

  async getPollForManagement(
    pollId: string,
    userId: string,
  ): Promise<PollDetailsDtoResponse> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    await this.assertActiveMembership(poll.organizationId, userId);

    if (
      poll.status === PollStatus.LIVE &&
      this.hasPollExpired(poll.expiresAt)
    ) {
      await this.closePollInternal(poll.id);
      poll.status = PollStatus.CLOSED;
    }

    return this.toPollDetailsResponse(poll);
  }

  async getPollForLiveView(pollId: string): Promise<PollDetailsDtoResponse> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (
      poll.status === PollStatus.LIVE &&
      this.hasPollExpired(poll.expiresAt)
    ) {
      await this.closePollInternal(poll.id);
      poll.status = PollStatus.CLOSED;
    }

    return this.toPollDetailsResponse(poll);
  }

  async updatePoll(
    pollId: string,
    dto: UpdatePollDtoRequest,
    userId: string,
  ): Promise<PollDetailsDtoResponse> {
    const existing = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Poll not found');
    }

    await this.assertActiveMembership(existing.organizationId, userId);

    let nextExpiresAt = existing.expiresAt;
    if (dto.expiresAt) {
      nextExpiresAt = new Date(dto.expiresAt);
      if (Number.isNaN(nextExpiresAt.getTime())) {
        throw new BadRequestException('Invalid expiresAt');
      }
      if (nextExpiresAt <= existing.startsAt) {
        throw new BadRequestException('expiresAt must be later than startsAt');
      }
    }

    const updated = await this.prisma.poll.update({
      where: { id: pollId },
      data: {
        title: dto.title?.trim(),
        description: dto.description?.trim(),
        expiresAt: dto.expiresAt ? nextExpiresAt : undefined,
        status: dto.status,
        allowAnonymous: dto.allowAnonymous,
        allowMultipleVotes: dto.allowMultipleVotes,
        showLiveResults: dto.showLiveResults,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (
      updated.status === PollStatus.CLOSED ||
      this.hasPollExpired(updated.expiresAt)
    ) {
      await this.closePollInternal(updated.id);
      updated.status = PollStatus.CLOSED;
    } else if (updated.status === PollStatus.LIVE) {
      this.schedulePollClosure(updated.id, updated.expiresAt);
    }

    return this.toPollDetailsResponse(updated);
  }

  async closePoll(pollId: string, userId: string): Promise<{ status: string }> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true, organizationId: true, status: true },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    await this.assertActiveMembership(poll.organizationId, userId);
    await this.closePollInternal(pollId);
    return { status: 'CLOSED' };
  }

  async deletePoll(
    pollId: string,
    userId: string,
  ): Promise<{ status: string }> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true, organizationId: true },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    await this.assertActiveMembership(poll.organizationId, userId);

    await this.prisma.poll.delete({
      where: { id: pollId },
    });

    const existing = this.closeTimeouts.get(pollId);
    if (existing) {
      clearTimeout(existing);
      this.closeTimeouts.delete(pollId);
    }

    return { status: 'DELETED' };
  }

  async exportPollResponsesCsv(
    pollId: string,
    userId: string,
  ): Promise<string> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    await this.assertActiveMembership(poll.organizationId, userId);

    const votes = await this.prisma.pollVote.findMany({
      where: { pollId },
      orderBy: { createdAt: 'asc' },
      select: {
        questionId: true,
        optionId: true,
        wordAnswer: true,
        participantName: true,
        userId: true,
        sessionId: true,
        createdAt: true,
      },
    });

    const questionMap = new Map(
      poll.questions.map((question) => [question.id, question]),
    );
    const optionMap = new Map<string, string>();
    for (const question of poll.questions) {
      for (const option of question.options) {
        optionMap.set(option.id, option.text);
      }
    }

    const escape = (value: string | null | undefined) => {
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = [
      'pollId',
      'questionId',
      'questionText',
      'type',
      'answer',
      'participantName',
      'userId',
      'sessionId',
      'createdAt',
    ];

    const lines = [headers.join(',')];

    for (const vote of votes) {
      const question = questionMap.get(vote.questionId);
      const answer =
        question?.type === PollType.MCQ
          ? (optionMap.get(vote.optionId ?? '') ?? '')
          : (vote.wordAnswer ?? '');

      lines.push(
        [
          poll.id,
          vote.questionId,
          question?.text ?? '',
          question?.type ?? '',
          answer,
          vote.participantName ?? '',
          vote.userId ?? '',
          vote.sessionId ?? '',
          vote.createdAt.toISOString(),
        ]
          .map(escape)
          .join(','),
      );
    }

    return lines.join('\n');
  }

  async getPollForJoinByCode(code: string): Promise<PollDetailsDtoResponse> {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      throw new BadRequestException('Poll code is required');
    }

    const directMatch = await this.prisma.poll.findUnique({
      where: { code: normalizedCode },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    let poll = directMatch;
    if (!poll) {
      const candidates = await this.prisma.poll.findMany({
        where: {
          status: PollStatus.LIVE,
        },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { options: { orderBy: { createdAt: 'asc' } } },
          },
        },
      });

      const matchedPolls = candidates.filter(
        (candidate) => this.toLegacyPollCode(candidate.id) === normalizedCode,
      );

      if (matchedPolls.length > 1) {
        throw new ConflictException(
          'Poll code collision. Use the full join link instead.',
        );
      }

      poll = matchedPolls[0];
    }

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (
      poll.status === PollStatus.LIVE &&
      this.hasPollExpired(poll.expiresAt)
    ) {
      await this.closePollInternal(poll.id);
      poll.status = PollStatus.CLOSED;
    }

    return this.toPollDetailsResponse(poll);
  }

  async submitVote(
    pollId: string,
    dto: VotePollDtoRequest,
    user: TokenPayload | undefined,
    anonymousId?: string,
  ): Promise<VotePollDtoResponse> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (
      !this.isPollActuallyActive(poll.status, poll.startsAt, poll.expiresAt)
    ) {
      if (
        poll.status === PollStatus.LIVE &&
        this.hasPollExpired(poll.expiresAt)
      ) {
        await this.closePollInternal(poll.id);
      }
      if (poll.status === PollStatus.DRAFT) {
        throw new BadRequestException('Poll has not started yet');
      }
      if (poll.startsAt > new Date()) {
        throw new BadRequestException('Poll has not started yet');
      }
      throw new BadRequestException('Poll is closed');
    }

    const userId = user?.sub ?? null;
    // Anonymous voting should be deduped using a stable server-issued identifier.
    // Never trust a client-provided sessionId for vote uniqueness/anti-abuse.
    const sessionId = userId ? null : (anonymousId ?? null);
    if (!userId && !sessionId) {
      throw new BadRequestException(
        'Anonymous identifier is required for anonymous votes',
      );
    }
    if (!poll.allowAnonymous && !userId) {
      throw new ForbiddenException('Anonymous voting is disabled');
    }
    const participantName = dto.participantName?.trim() || null;

    const baseVoterKey = userId ? `user:${userId}` : `session:${sessionId}`;

    if (!poll.allowMultipleVotes) {
      const existingVote = await this.prisma.pollVote.findFirst({
        where: {
          pollId,
          questionId: dto.questionId,
          voterKey: baseVoterKey,
        },
        select: { id: true },
      });

      if (existingVote) {
        throw new ConflictException('Vote already submitted for this question');
      }
    }

    const question = poll.questions.find((item) => item.id === dto.questionId);
    if (!question) {
      throw new BadRequestException('Question does not belong to this poll');
    }

    let optionId: string | null = null;
    let wordAnswer: string | null = null;

    if (question.type === PollType.MCQ) {
      optionId = dto.optionId ?? null;
      if (!optionId) {
        throw new BadRequestException('optionId is required for MCQ questions');
      }

      const optionExists = question.options.some(
        (option) => option.id === optionId,
      );
      if (!optionExists) {
        throw new BadRequestException(
          'Selected option does not belong to this question',
        );
      }
    } else {
      wordAnswer = this.normalizeWord(dto.wordAnswer);
      if (!wordAnswer) {
        throw new BadRequestException(
          'wordAnswer is required for ONE_WORD questions',
        );
      }
    }

    await this.hydrateRedisIfNeeded(poll.id, poll.questions);

    const voterKey = poll.allowMultipleVotes
      ? `${baseVoterKey}:${randomUUID()}`
      : baseVoterKey;

    let vote;
    try {
      vote = await this.prisma.pollVote.create({
        data: {
          pollId,
          questionId: question.id,
          optionId,
          wordAnswer,
          userId,
          sessionId,
          voterKey,
          participantName,
        },
      });
    } catch (error) {
      const known = error as Prisma.PrismaClientKnownRequestError;
      if (known.code === 'P2002') {
        throw new ConflictException('Vote already submitted for this question');
      }
      throw error;
    }

    const totalVotes = await this.realtimeService.incrementVoteCount(poll.id);
    let optionVotes = 0;
    let wordCount = 0;

    if (question.type === PollType.MCQ && optionId) {
      optionVotes = await this.realtimeService.incrementOptionVote(
        poll.id,
        question.id,
        optionId,
      );
    }

    if (question.type === PollType.ONE_WORD && wordAnswer) {
      wordCount = await this.realtimeService.incrementWordVote(
        poll.id,
        question.id,
        wordAnswer,
      );
    }

    const stats = await this.realtimeService.getStats(poll.id);

    this.pollGateway.emitVoteUpdate(poll.id, {
      questionId: question.id,
      totalVotes,
      optionId: optionId ?? undefined,
      optionVotes: optionId ? optionVotes : undefined,
      word: wordAnswer ?? undefined,
      wordCount: wordAnswer ? wordCount : undefined,
    });

    if (wordAnswer) {
      this.pollGateway.emitWordUpdate(
        poll.id,
        question.id,
        wordAnswer,
        wordCount,
      );
    }

    this.pollGateway.emitStatsUpdate(poll.id, stats.viewers, stats.votes);

    if (question.type === PollType.MCQ) {
      const momentum = await this.realtimeService.computeMomentum(
        poll.id,
        question.id,
      );
      this.pollGateway.emitMomentumUpdate(poll.id, question.id, momentum);
    }

    return {
      voteId: vote.id,
      pollId: vote.pollId,
      createdAt: vote.createdAt,
    };
  }

  async getPollResults(pollId: string): Promise<PollResultsDtoResponse> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (
      poll.status === PollStatus.LIVE &&
      this.hasPollExpired(poll.expiresAt)
    ) {
      await this.closePollInternal(poll.id);
      poll.status = PollStatus.CLOSED;
    }

    if (!poll.showLiveResults && poll.status !== PollStatus.CLOSED) {
      throw new ForbiddenException('Live results are disabled for this poll');
    }

    await this.hydrateRedisIfNeeded(poll.id, poll.questions);
    const stats = await this.realtimeService.getStats(poll.id);

    const questionResults: Array<{
      questionId: string;
      text: string;
      type: PollType;
      totalVotes: number;
      optionResults: Array<{
        optionId: string;
        text: string;
        votes: number;
        percentage: number;
        momentum: 'SURGE' | 'TRENDING' | 'LOSING' | 'STABLE';
      }>;
      wordCounts: Array<{ word: string; count: number }>;
      surgeDetected?: boolean;
    }> = [];

    for (const question of poll.questions) {
      if (question.type === PollType.MCQ) {
        const optionCounts = await this.realtimeService.getOptionCounts(
          poll.id,
          question.id,
        );
        const momentum = await this.realtimeService.computeMomentum(
          poll.id,
          question.id,
        );

        const totalQuestionVotes = Object.values(optionCounts).reduce(
          (sum, count) => sum + Number(count ?? 0),
          0,
        );

        const optionResults = question.options.map((option) => {
          const votes = Number(optionCounts[option.id] ?? 0);
          const percentage =
            totalQuestionVotes > 0
              ? Number(((votes / totalQuestionVotes) * 100).toFixed(2))
              : 0;

          return {
            optionId: option.id,
            text: option.text,
            votes,
            percentage,
            momentum: momentum.optionMomentum[option.id] ?? 'STABLE',
          };
        });

        questionResults.push({
          questionId: question.id,
          text: question.text,
          type: question.type,
          totalVotes: totalQuestionVotes,
          optionResults,
          wordCounts: [],
          surgeDetected: momentum.surgeDetected,
        });
      } else {
        const wordCounts = await this.realtimeService.getWordCounts(
          poll.id,
          question.id,
        );
        const words = Object.entries(wordCounts)
          .map(([word, count]) => ({ word, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 100);
        const totalQuestionVotes = words.reduce(
          (sum, entry) => sum + entry.count,
          0,
        );

        questionResults.push({
          questionId: question.id,
          text: question.text,
          type: question.type,
          totalVotes: totalQuestionVotes,
          optionResults: [],
          wordCounts: words,
        });
      }
    }

    const isActive = this.isPollActuallyActive(
      poll.status,
      poll.startsAt,
      poll.expiresAt,
    );
    const now = Date.now();
    const timeRemainingMs = isActive
      ? Math.max(poll.expiresAt.getTime() - now, 0)
      : 0;

    return {
      pollId: poll.id,
      status: poll.status,
      isActive,
      expiresAt: poll.expiresAt,
      timeRemainingMs,
      totalVotes: stats.votes,
      questions: questionResults,
      participation: {
        viewers: stats.viewers,
        votes: stats.votes,
        participationPercent:
          stats.viewers > 0
            ? Number(((stats.votes / stats.viewers) * 100).toFixed(2))
            : 0,
      },
    };
  }

  private async bootstrapPollSchedules(): Promise<void> {
    const now = new Date();
    const activePolls = await this.prisma.poll.findMany({
      where: {
        status: PollStatus.LIVE,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });

    for (const poll of activePolls) {
      if (poll.expiresAt <= now) {
        await this.closePollInternal(poll.id);
      } else {
        this.schedulePollClosure(poll.id, poll.expiresAt);
      }
    }
  }

  private schedulePollClosure(pollId: string, expiresAt: Date): void {
    const existing = this.closeTimeouts.get(pollId);
    if (existing) {
      clearTimeout(existing);
    }

    const delay = expiresAt.getTime() - Date.now();
    if (delay <= 0) {
      void this.closePollInternal(pollId);
      return;
    }

    const timeout = setTimeout(() => {
      void this.closePollInternal(pollId);
    }, delay);

    this.closeTimeouts.set(pollId, timeout);
  }

  private async closePollInternal(pollId: string): Promise<void> {
    const result = await this.prisma.poll.updateMany({
      where: {
        id: pollId,
        status: PollStatus.LIVE,
      },
      data: {
        status: PollStatus.CLOSED,
      },
    });

    const existing = this.closeTimeouts.get(pollId);
    if (existing) {
      clearTimeout(existing);
      this.closeTimeouts.delete(pollId);
    }

    if (result.count > 0) {
      this.pollGateway.emitPollClosed(pollId);
      this.logger.log(`Poll closed: ${pollId}`);
    }
  }

  private async hydrateRedisIfNeeded(
    pollId: string,
    questions: Array<{
      id: string;
      type: PollType;
      options: Array<{ id: string }>;
    }>,
  ): Promise<void> {
    const stats = await this.realtimeService.getStats(pollId);
    if (stats.votes > 0) {
      return;
    }

    const votes = await this.prisma.pollVote.findMany({
      where: { pollId },
      select: {
        questionId: true,
        optionId: true,
        wordAnswer: true,
      },
    });

    await this.realtimeService.rebuildCountersFromVotes(
      pollId,
      questions,
      votes,
    );
  }

  private async assertActiveMembership(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      select: {
        status: true,
      },
    });

    if (!membership || membership.status !== OrganizationMemberStatus.ACTIVE) {
      throw new ForbiddenException(
        'Only active organization members can manage polls',
      );
    }
  }

  private normalizeOptions(options: string[]): string[] {
    const sanitized = options
      .map((option) => option.trim())
      .filter((option) => option.length > 0);

    const unique: string[] = [];
    const seen = new Set<string>();

    for (const option of sanitized) {
      const key = option.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(option);
      }
    }

    return unique;
  }

  private normalizeQuestions(
    questions: Array<{
      text: string;
      type: PollType;
      options?: string[];
    }>,
  ): Array<{ text: string; type: PollType; options: string[] }> {
    return questions.map((question) => {
      const text = question.text?.trim();
      if (!text) {
        throw new BadRequestException('Question text is required');
      }

      const normalizedOptions = this.normalizeOptions(question.options ?? []);

      if (question.type === PollType.MCQ && normalizedOptions.length < 2) {
        throw new BadRequestException(
          'MCQ questions require at least 2 options',
        );
      }

      if (question.type === PollType.ONE_WORD && normalizedOptions.length > 0) {
        throw new BadRequestException(
          'ONE_WORD questions cannot contain options',
        );
      }

      return {
        text,
        type: question.type,
        options: normalizedOptions,
      };
    });
  }

  private normalizeWord(input?: string): string | null {
    if (!input) {
      return null;
    }

    const normalized = input.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    if (!/^[a-z0-9_-]+$/i.test(normalized)) {
      throw new BadRequestException(
        'wordAnswer must contain only letters, digits, "_" or "-"',
      );
    }

    return normalized;
  }

  private isPollActuallyActive(
    status: PollStatus,
    startsAt: Date,
    expiresAt: Date,
  ): boolean {
    const now = new Date();
    return status === PollStatus.LIVE && startsAt <= now && expiresAt > now;
  }

  private hasPollExpired(expiresAt: Date): boolean {
    return expiresAt <= new Date();
  }

  private generatePollCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let index = 0; index < 8; index += 1) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      code += alphabet[randomIndex];
    }
    return code;
  }

  private toLegacyPollCode(pollId: string): string {
    return pollId.slice(-6).toUpperCase();
  }

  private toPollDetailsResponse(poll: {
    id: string;
    code?: string;
    organizationId: string;
    title: string;
    description: string | null;
    status: PollStatus;
    startsAt: Date;
    expiresAt: Date;
    allowAnonymous: boolean;
    allowMultipleVotes: boolean;
    showLiveResults: boolean;
    createdBy: string;
    createdAt: Date;
    questions: Array<{
      id: string;
      text: string;
      type: PollType;
      options: Array<{ id: string; text: string }>;
    }>;
  }): PollDetailsDtoResponse {
    return {
      id: poll.id,
      code: poll.code ?? this.toLegacyPollCode(poll.id),
      organizationId: poll.organizationId,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      isActive: this.isPollActuallyActive(
        poll.status,
        poll.startsAt,
        poll.expiresAt,
      ),
      startsAt: poll.startsAt,
      expiresAt: poll.expiresAt,
      allowAnonymous: poll.allowAnonymous,
      allowMultipleVotes: poll.allowMultipleVotes,
      showLiveResults: poll.showLiveResults,
      createdBy: poll.createdBy,
      createdAt: poll.createdAt,
      questions: poll.questions.map((question) => ({
        id: question.id,
        text: question.text,
        type: question.type,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
        })),
      })),
    };
  }
}
