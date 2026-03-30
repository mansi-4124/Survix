import { Injectable } from '@nestjs/common';
import { ISessionStore } from '../domain/interfaces/session-store.interface';
import { PrismaService } from 'prisma/prisma.service';
import { RefreshSession } from '../domain/types/refresh-session.type';

@Injectable()
export class PrismaSessionStore implements ISessionStore {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: RefreshSession): Promise<RefreshSession> {
    const record = await this.prisma.session.create({
      data: {
        sessionId: session.sessionId,
        userId: session.userId,
        refreshTokenHash: session.refreshTokenHash,
        expiresAt: session.expiresAt,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
      },
    });

    return this.toDomain(record);
  }

  async findBySessionId(sessionId: string): Promise<RefreshSession | null> {
    const record = await this.prisma.session.findUnique({
      where: { sessionId },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async update(
    sessionId: string,
    data: {
      refreshTokenHash: string;
      expiresAt: Date;
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<void> {
    await this.prisma.session.update({
      where: { sessionId },
      data: {
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        revokedAt: null,
      },
    });
  }
  async delete(sessionId: string) {
    await this.prisma.session.delete({
      where: { sessionId },
    });
  }

  async deleteAllByUser(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async deleteOldestByUser(userId: string, keepLatest: number) {
    if (keepLatest <= 0) {
      await this.deleteAllByUser(userId);
      return;
    }

    const sessionsToDelete = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: keepLatest,
      select: { sessionId: true },
    });

    if (sessionsToDelete.length === 0) return;

    await this.prisma.session.deleteMany({
      where: { sessionId: { in: sessionsToDelete.map((s) => s.sessionId) } },
    });
  }

  private toDomain(record: any): RefreshSession {
    return {
      sessionId: record.sessionId,
      userId: record.userId,
      refreshTokenHash: record.refreshTokenHash,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
    };
  }
}
