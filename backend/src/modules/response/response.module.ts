import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SurveyModule } from '../survey/survey.module';
import { ResponseController } from './response.controller';
import { ResponseAccessGuard } from './guards/response-access.guard';
import { ResponseService } from './services/response.service';

@Module({
  imports: [PrismaModule, AuthModule, SurveyModule],
  controllers: [ResponseController],
  providers: [ResponseService, ResponseAccessGuard],
})
export class ResponseModule {}
