import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SurveyStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { SurveyService } from './survey.service';

@Injectable()
export class SurveySchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SurveySchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly surveyService: SurveyService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.processSchedules();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processSchedules(): Promise<void> {
    await this.publishScheduledSurveys();
    await this.closeExpiredSurveys();
  }

  private async publishScheduledSurveys(): Promise<void> {
    const now = new Date();
    const candidates = await this.prisma.survey.findMany({
      where: {
        status: SurveyStatus.SCHEDULED,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
        AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }],
      },
      select: { id: true },
    });

    for (const survey of candidates) {
      const result = await this.surveyService.publishScheduledSurvey(survey.id);
      if (result) {
        this.logger.log(`Survey published on schedule: ${survey.id}`);
      }
    }
  }

  private async closeExpiredSurveys(): Promise<void> {
    const now = new Date();
    const result = await this.prisma.survey.updateMany({
      where: {
        status: SurveyStatus.PUBLISHED,
        endDate: { lte: now },
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      data: {
        status: SurveyStatus.CLOSED,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Surveys closed on schedule: ${result.count}`);
    }
  }
}
