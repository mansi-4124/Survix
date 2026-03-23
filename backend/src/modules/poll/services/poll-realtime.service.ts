import { Inject, Injectable } from '@nestjs/common';
import { PollType } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { REDIS_CLIENT } from 'src/common/redis/redis.module';

type PollStats = {
  viewers: number;
  votes: number;
};

type PollMomentum = {
  surgeDetected: boolean;
  optionMomentum: Record<string, 'SURGE' | 'TRENDING' | 'LOSING' | 'STABLE'>;
};

@Injectable()
export class PollRealtimeService {
  private readonly momentumIntervalMs = Number(
    process.env.POLL_MOMENTUM_INTERVAL_MS ?? 5000,
  );

  private readonly surgeThreshold = Number(
    process.env.POLL_SURGE_THRESHOLD ?? 5,
  );

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async initializePollCounters(
    pollId: string,
    questions: Array<{ questionId: string; optionIds: string[] }>,
    resetStats = false,
  ): Promise<void> {
    const statsKey = this.statsKey(pollId);

    for (const question of questions) {
      if (question.optionIds.length > 0) {
        const optionPairs: Record<string, number> = {};
        for (const optionId of question.optionIds) {
          optionPairs[optionId] = 0;
        }
        await this.redis.hset(
          this.optionsKey(pollId, question.questionId),
          optionPairs,
        );
      }
    }

    if (resetStats) {
      await this.redis.hset(statsKey, { viewers: 0, votes: 0 });
    } else {
      const stats = await this.redis.hgetall<Record<string, string>>(statsKey);
      if (!stats || Object.keys(stats).length === 0) {
        await this.redis.hset(statsKey, { viewers: 0, votes: 0 });
      }
    }
  }

  async incrementOptionVote(
    pollId: string,
    questionId: string,
    optionId: string,
  ): Promise<number> {
    return this.redis.hincrby(this.optionsKey(pollId, questionId), optionId, 1);
  }

  async incrementWordVote(
    pollId: string,
    questionId: string,
    word: string,
  ): Promise<number> {
    return this.redis.hincrby(this.wordsKey(pollId, questionId), word, 1);
  }

  async incrementVoteCount(pollId: string): Promise<number> {
    return this.redis.hincrby(this.statsKey(pollId), 'votes', 1);
  }

  async incrementViewers(pollId: string): Promise<PollStats> {
    const viewers = await this.redis.hincrby(
      this.statsKey(pollId),
      'viewers',
      1,
    );
    const votes = await this.getVotes(pollId);
    return {
      viewers: Math.max(viewers, 0),
      votes,
    };
  }

  async decrementViewers(pollId: string): Promise<PollStats> {
    const currentViewers = await this.getViewers(pollId);
    const nextViewers = Math.max(currentViewers - 1, 0);
    await this.redis.hset(this.statsKey(pollId), { viewers: nextViewers });

    return {
      viewers: nextViewers,
      votes: await this.getVotes(pollId),
    };
  }

  async getOptionCounts(
    pollId: string,
    questionId: string,
  ): Promise<Record<string, number>> {
    const raw = await this.redis.hgetall<Record<string, string>>(
      this.optionsKey(pollId, questionId),
    );
    const parsed: Record<string, number> = {};

    for (const [key, value] of Object.entries(raw ?? {})) {
      parsed[key] = Number(value ?? 0);
    }

    return parsed;
  }

  async getWordCounts(
    pollId: string,
    questionId: string,
  ): Promise<Record<string, number>> {
    const raw = await this.redis.hgetall<Record<string, string>>(
      this.wordsKey(pollId, questionId),
    );
    const parsed: Record<string, number> = {};

    for (const [key, value] of Object.entries(raw ?? {})) {
      parsed[key] = Number(value ?? 0);
    }

    return parsed;
  }

  async getStats(pollId: string): Promise<PollStats> {
    const raw = await this.redis.hgetall<Record<string, string>>(
      this.statsKey(pollId),
    );
    return {
      viewers: Number(raw?.viewers ?? 0),
      votes: Number(raw?.votes ?? 0),
    };
  }

  async rebuildCountersFromVotes(
    pollId: string,
    questions: Array<{
      id: string;
      type: PollType;
      options: Array<{ id: string }>;
    }>,
    votes: Array<{
      questionId: string;
      optionId?: string | null;
      wordAnswer?: string | null;
    }>,
  ): Promise<void> {
    const optionsByQuestion = new Map<string, Record<string, number>>();
    const wordsByQuestion = new Map<string, Record<string, number>>();

    for (const question of questions) {
      const options: Record<string, number> = {};
      if (question.type === PollType.MCQ) {
        for (const option of question.options) {
          options[option.id] = 0;
        }
      }
      optionsByQuestion.set(question.id, options);
      wordsByQuestion.set(question.id, {});
    }

    for (const vote of votes) {
      const question = questions.find((item) => item.id === vote.questionId);
      if (!question) {
        continue;
      }

      if (question.type === PollType.MCQ && vote.optionId) {
        const options = optionsByQuestion.get(question.id) ?? {};
        options[vote.optionId] = (options[vote.optionId] ?? 0) + 1;
        optionsByQuestion.set(question.id, options);
      }

      if (question.type === PollType.ONE_WORD && vote.wordAnswer) {
        const words = wordsByQuestion.get(question.id) ?? {};
        words[vote.wordAnswer] = (words[vote.wordAnswer] ?? 0) + 1;
        wordsByQuestion.set(question.id, words);
      }
    }

    for (const question of questions) {
      const options = optionsByQuestion.get(question.id) ?? {};
      await this.redis.del(this.optionsKey(pollId, question.id));
      if (Object.keys(options).length > 0) {
        await this.redis.hset(this.optionsKey(pollId, question.id), options);
      }

      const words = wordsByQuestion.get(question.id) ?? {};
      await this.redis.del(this.wordsKey(pollId, question.id));
      if (Object.keys(words).length > 0) {
        await this.redis.hset(this.wordsKey(pollId, question.id), words);
      }

      if (question.type === PollType.MCQ) {
        await this.redis.hset(this.snapshotKey(pollId, question.id), {
          totalVotes: Object.values(options).reduce(
            (sum, count) => sum + Number(count ?? 0),
            0,
          ),
          updatedAt: Date.now(),
          ...Object.fromEntries(
            Object.entries(options).map(([k, v]) => [`opt:${k}`, v]),
          ),
        });
      }
    }

    const existing = await this.getStats(pollId);
    await this.redis.hset(this.statsKey(pollId), {
      viewers: existing.viewers,
      votes: votes.length,
    });
  }

  async computeMomentum(
    pollId: string,
    questionId: string,
  ): Promise<PollMomentum> {
    const optionCounts = await this.getOptionCounts(pollId, questionId);

    const now = Date.now();
    const snapshot = await this.redis.hgetall<Record<string, string>>(
      this.snapshotKey(pollId, questionId),
    );
    const previousUpdatedAt = Number(snapshot?.updatedAt ?? 0);
    const elapsed = now - previousUpdatedAt;

    if (elapsed < this.momentumIntervalMs) {
      return {
        surgeDetected: false,
        optionMomentum: Object.fromEntries(
          Object.keys(optionCounts).map((id) => [id, 'STABLE']),
        ),
      };
    }

    const previousTotalVotes = Number(snapshot?.totalVotes ?? 0);
    const currentTotalVotes = Object.values(optionCounts).reduce(
      (sum, count) => sum + Number(count ?? 0),
      0,
    );
    const totalDelta = currentTotalVotes - previousTotalVotes;
    const surgeDetected = totalDelta >= this.surgeThreshold;

    let maxDeltaOptionId = '';
    let maxDelta = Number.NEGATIVE_INFINITY;
    const deltas: Record<string, number> = {};
    const momentum: Record<string, 'SURGE' | 'TRENDING' | 'LOSING' | 'STABLE'> =
      {};

    for (const [optionId, currentVotes] of Object.entries(optionCounts)) {
      const previousVotes = Number(snapshot?.[`opt:${optionId}`] ?? 0);
      const delta = currentVotes - previousVotes;
      deltas[optionId] = delta;

      if (delta > maxDelta) {
        maxDelta = delta;
        maxDeltaOptionId = optionId;
      }
    }

    for (const [optionId, delta] of Object.entries(deltas)) {
      if (surgeDetected && delta > 0) {
        momentum[optionId] = 'SURGE';
        continue;
      }

      if (optionId === maxDeltaOptionId && delta > 0) {
        momentum[optionId] = 'TRENDING';
        continue;
      }

      if (delta < 0) {
        momentum[optionId] = 'LOSING';
        continue;
      }

      momentum[optionId] = 'STABLE';
    }

    await this.redis.hset(this.snapshotKey(pollId, questionId), {
      totalVotes: currentTotalVotes,
      updatedAt: now,
      ...Object.fromEntries(
        Object.entries(optionCounts).map(([k, v]) => [`opt:${k}`, v]),
      ),
    });

    return {
      surgeDetected,
      optionMomentum: momentum,
    };
  }

  private async getVotes(pollId: string): Promise<number> {
    const stats = await this.redis.hget(this.statsKey(pollId), 'votes');
    return Number(stats ?? 0);
  }

  private async getViewers(pollId: string): Promise<number> {
    const viewers = await this.redis.hget(this.statsKey(pollId), 'viewers');
    return Number(viewers ?? 0);
  }

  private optionsKey(pollId: string, questionId: string): string {
    return `poll:${pollId}:question:${questionId}:options`;
  }

  private wordsKey(pollId: string, questionId: string): string {
    return `poll:${pollId}:question:${questionId}:words`;
  }

  private statsKey(pollId: string): string {
    return `poll:${pollId}:stats`;
  }

  private snapshotKey(pollId: string, questionId: string): string {
    return `poll:${pollId}:question:${questionId}:snapshot`;
  }
}
