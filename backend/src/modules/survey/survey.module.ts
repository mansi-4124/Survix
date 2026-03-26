import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrganizationModule } from '../organization/organization.module';
import { SurveyController } from './survey.controller';
import { SurveyAccessGuard } from './guards/survey-access.guard';
import { SurveyEditGuard } from './guards/survey-edit.guard';
import { QuestionSettingsValidationPipe } from './pipes/question-settings-validation.pipe';
import { SurveyOwnershipValidationPipe } from './pipes/survey-ownership-validation.pipe';
import { SurveyAccessTokenService } from './services/survey-access-token.service';
import { SurveyService } from './services/survey.service';
import { SurveySchedulerService } from './services/survey-scheduler.service';
import { PrismaModule } from 'prisma/prisma.module';
import { RedisModule } from 'src/common/redis/redis.module';
import { EmailModule } from 'src/common/email/email.module';
import { RevisionIncrementInterceptor } from './interceptors/revision-increment.interceptor';
import { SURVEY_TOKENS } from './survey.tokens';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    EmailModule,
    forwardRef(() => AuthModule),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [SurveyController],
  providers: [
    SurveyService,
    SurveySchedulerService,
    SurveyAccessTokenService,
    {
      provide: SURVEY_TOKENS.SURVEY_ACCESS_TOKEN_SERVICE,
      useExisting: SurveyAccessTokenService,
    },
    SurveyAccessGuard,
    SurveyEditGuard,
    SurveyOwnershipValidationPipe,
    QuestionSettingsValidationPipe,
    RevisionIncrementInterceptor,
  ],
  exports: [
    SurveyAccessGuard,
    SurveyEditGuard,
    SurveyService,
    SurveyAccessTokenService,
    SURVEY_TOKENS.SURVEY_ACCESS_TOKEN_SERVICE,
  ],
})
export class SurveyModule {}
