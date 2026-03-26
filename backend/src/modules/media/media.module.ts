import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { SurveyModule } from '../survey/survey.module';
import { MediaController } from './media.controller';
import { CloudinaryService } from './services/cloudinary.service';
import { MediaService } from './services/media.service';

@Module({
  imports: [PrismaModule, forwardRef(() => SurveyModule)],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService],
  exports: [CloudinaryService],
})
export class MediaModule {}
