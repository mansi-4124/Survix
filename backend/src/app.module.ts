import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import validationSchema from './config/validation.schema';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './common/redis/redis.module';
import { EmailModule } from './common/email/email.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { OrganizationModule } from './modules/organization/organization.module';
import { SurveyModule } from './modules/survey/survey.module';
import { ResponseModule } from './modules/response/response.module';
import { MediaModule } from './modules/media/media.module';
import { AnonymousIdMiddleware } from './common/middleware/anonymous-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    PrismaModule,
    RedisModule,
    EmailModule,
    AuthModule,
    OrganizationModule,
    SurveyModule,
    ResponseModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');

    consumer
      .apply(RateLimitMiddleware)
      .forRoutes(
        'auth/login',
        'auth/signup',
        'auth/verify-email',
        'auth/forgot-password',
        'auth/reset-password',
        'auth/google',
      );

    consumer
      .apply(AnonymousIdMiddleware)
      .forRoutes('surveys/:surveyId/responses/start', 'responses/:responseId/*');
  }
}
