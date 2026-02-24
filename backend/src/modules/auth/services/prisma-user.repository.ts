import { Injectable } from '@nestjs/common';

import {
  IUserRepository,
  CreateUserInput,
  UpdateUserInput,
} from '../domain/interfaces/user-repository.interface';

import {
  UserStatus as PrismaUserStatus,
  AuthType as PrismaAuthType,
} from '@prisma/client';

import { AuthProvider, AuthUser } from '../domain/types/auth-user.type';
import { AccountStatus } from '../domain/enums/account-status.enum';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /*
  =====================================================
  FIND BY EMAIL
  =====================================================
  */
  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  /*
  =====================================================
  FIND BY ID
  =====================================================
  */
  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  /*
  =====================================================
  CREATE USER
  =====================================================
  */
  async create(data: CreateUserInput): Promise<AuthUser> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        status: this.mapStatusToPrisma(data.status),
        authType: PrismaAuthType.LOCAL,
        emailVerified: data.emailVerified,
        failedLoginAttempts: data.failedLoginAttempts,
        lockUntil: data.lockUntil,
        name: data.name,
        avatar: data.avatar,
      },
    });

    return this.toDomain(user);
  }

  /*
  =====================================================
  CREATE GOOGLE USER
  =====================================================
  */
  async createGoogleUser(data: CreateUserInput): Promise<AuthUser> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        status: this.mapStatusToPrisma(data.status),
        emailVerified: data.emailVerified,
        failedLoginAttempts: 0,
        lockUntil: null,
        authType: PrismaAuthType.GOOGLE,
      },
    });

    return this.toDomain(user);
  }

  /*
  =====================================================
  UPDATE USER
  =====================================================
  */
  async update(id: string, data: UpdateUserInput): Promise<AuthUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? this.mapStatusToPrisma(data.status) : undefined,
      },
    });

    return this.toDomain(user);
  }

  /*
  =====================================================
  UPDATE PASSWORD ONLY
  =====================================================
  */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  /*
  =====================================================
  MAPPER
  =====================================================
  */
  private toDomain(prismaUser: any): AuthUser {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      username: prismaUser.username,
      name: prismaUser.name,
      avatar: prismaUser.avatar,
      passwordHash: prismaUser.passwordHash,
      status: this.mapStatusToDomain(prismaUser.status),
      provider: this.mapProviderToDomain(prismaUser.authType),
      emailVerified: prismaUser.emailVerified,
      failedLoginAttempts: prismaUser.failedLoginAttempts,
      lockUntil: prismaUser.lockUntil,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }
  private mapStatusToPrisma(status: AccountStatus): PrismaUserStatus {
    return PrismaUserStatus[status];
  }

  private mapStatusToDomain(status: PrismaUserStatus): AccountStatus {
    return AccountStatus[status];
  }
  private mapProviderToDomain(authType: PrismaAuthType): AuthProvider {
    switch (authType) {
      case PrismaAuthType.LOCAL:
        return AuthProvider.LOCAL;

      case PrismaAuthType.GOOGLE:
        return AuthProvider.GOOGLE;

      case PrismaAuthType.BOTH:
        return AuthProvider.BOTH;

      default: {
        const _exhaustiveCheck: never = authType;
        throw new Error(`Unhandled authType: ${_exhaustiveCheck}`);
      }
    }
  }

  private mapProviderToPrisma(provider: AuthProvider): PrismaAuthType {
    switch (provider) {
      case AuthProvider.LOCAL:
        return PrismaAuthType.LOCAL;

      case AuthProvider.GOOGLE:
        return PrismaAuthType.GOOGLE;

      case AuthProvider.BOTH:
        return PrismaAuthType.BOTH;

      default: {
        const _exhaustiveCheck: never = provider;
        throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
      }
    }
  }
}
