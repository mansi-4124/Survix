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
      where: { id: sessionId },
    });

    if (!record) return null;

    return this.toDomain(record);
  }
  async delete(sessionId: string) {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async deleteAllByUser(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  private toDomain(record: any): RefreshSession {
    return {
      sessionId: record.id,
      userId: record.userId,
      refreshTokenHash: record.refreshTokenHash,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
    };
  }
}
