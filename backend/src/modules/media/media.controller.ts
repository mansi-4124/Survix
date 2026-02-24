import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FileUploadInterceptor } from 'src/common/interceptors/file-upload.interceptor';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import type { UploadedFileType } from 'src/common/types/uploaded-file.type';
import type { TokenPayload } from '../auth/domain/types/token-payload.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SurveyAccessGuard } from '../survey/guards/survey-access.guard';
import { MediaService } from './services/media.service';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard)
  @UseInterceptors(FileUploadInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadMedia(
    @Query('surveyId', ParseObjectIdPipe) surveyId: string,
    @CurrentUser() user: TokenPayload,
    @UploadedFile() file: UploadedFileType,
  ) {
    return this.mediaService.uploadToSurvey(surveyId, user.sub, file);
  }
}
