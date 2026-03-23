import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PrismaService } from 'prisma/prisma.service';
import { Server, Socket } from 'socket.io';
import { PollRealtimeService } from '../services/poll-realtime.service';

type JoinPollPayload = {
  pollId: string;
};

@WebSocketGateway({
  namespace: '/polls',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class PollGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PollGateway.name);
  private readonly clientPolls = new Map<string, Set<string>>();

  constructor(
    private readonly realtimeService: PollRealtimeService,
    private readonly prisma: PrismaService,
  ) {}

  @SubscribeMessage('join_poll')
  async handleJoinPoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPollPayload,
  ) {
    const pollId = payload?.pollId;
    if (!pollId || !/^[a-fA-F0-9]{24}$/.test(pollId)) {
      client.emit('poll_error', { message: 'Invalid poll id' });
      return;
    }

    const pollExists = await this.prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true },
    });
    if (!pollExists) {
      client.emit('poll_error', { message: 'Poll not found' });
      return;
    }

    const isFirstJoinForClient = !this.hasClientPoll(client.id, pollId);
    void client.join(this.getRoomName(pollId));
    this.trackClientPoll(client.id, pollId);

    if (isFirstJoinForClient) {
      const stats = await this.realtimeService.incrementViewers(pollId);
      this.emitStatsUpdate(pollId, stats.viewers, stats.votes);
    }
  }

  @SubscribeMessage('leave_poll')
  async handleLeavePoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPollPayload,
  ) {
    const pollId = payload?.pollId;
    if (!pollId || !/^[a-fA-F0-9]{24}$/.test(pollId)) {
      return;
    }

    const wasTracked = this.hasClientPoll(client.id, pollId);
    void client.leave(this.getRoomName(pollId));
    this.untrackClientPoll(client.id, pollId);

    if (wasTracked) {
      const stats = await this.realtimeService.decrementViewers(pollId);
      this.emitStatsUpdate(pollId, stats.viewers, stats.votes);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const polls = this.clientPolls.get(client.id);
    if (!polls || polls.size === 0) {
      return;
    }

    this.clientPolls.delete(client.id);

    for (const pollId of polls) {
      try {
        const stats = await this.realtimeService.decrementViewers(pollId);
        this.emitStatsUpdate(pollId, stats.viewers, stats.votes);
      } catch {
        this.logger.warn(`Failed to decrement viewers for poll ${pollId}`);
      }
    }
  }

  emitVoteUpdate(
    pollId: string,
    payload: {
      questionId: string;
      totalVotes: number;
      optionId?: string;
      optionVotes?: number;
      word?: string;
      wordCount?: number;
    },
  ): void {
    this.server.to(this.getRoomName(pollId)).emit('vote_update', {
      pollId,
      ...payload,
    });
  }

  emitWordUpdate(
    pollId: string,
    questionId: string,
    word: string,
    count: number,
  ): void {
    this.server.to(this.getRoomName(pollId)).emit('word_update', {
      pollId,
      questionId,
      word,
      count,
    });
  }

  emitStatsUpdate(pollId: string, viewers: number, votes: number): void {
    this.server.to(this.getRoomName(pollId)).emit('stats_update', {
      pollId,
      viewers,
      votes,
      participationPercent:
        viewers > 0 ? Number(((votes / viewers) * 100).toFixed(2)) : 0,
    });
  }

  emitMomentumUpdate(
    pollId: string,
    questionId: string,
    payload: {
      surgeDetected: boolean;
      optionMomentum: Record<
        string,
        'SURGE' | 'TRENDING' | 'LOSING' | 'STABLE'
      >;
    },
  ): void {
    this.server.to(this.getRoomName(pollId)).emit('momentum_update', {
      pollId,
      questionId,
      ...payload,
    });
  }

  emitPollClosed(pollId: string): void {
    this.server.to(this.getRoomName(pollId)).emit('poll_closed', {
      pollId,
      closedAt: new Date().toISOString(),
    });
  }

  private getRoomName(pollId: string): string {
    return `poll:${pollId}`;
  }

  private trackClientPoll(clientId: string, pollId: string): void {
    const existing = this.clientPolls.get(clientId) ?? new Set<string>();
    existing.add(pollId);
    this.clientPolls.set(clientId, existing);
  }

  private hasClientPoll(clientId: string, pollId: string): boolean {
    const existing = this.clientPolls.get(clientId);
    return Boolean(existing?.has(pollId));
  }

  private untrackClientPoll(clientId: string, pollId: string): void {
    const existing = this.clientPolls.get(clientId);
    if (!existing) {
      return;
    }

    existing.delete(pollId);
    if (existing.size === 0) {
      this.clientPolls.delete(clientId);
      return;
    }

    this.clientPolls.set(clientId, existing);
  }
}
