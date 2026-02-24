import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SurveyModule } from '../survey/survey.module';
import { MediaController } from './media.controller';
import { CloudinaryService } from './services/cloudinary.service';
import { MediaService } from './services/media.service';

@Module({
  imports: [PrismaModule, AuthModule, SurveyModule],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService],
})
export class MediaModule {}
