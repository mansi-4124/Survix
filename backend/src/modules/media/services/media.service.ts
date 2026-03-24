import { ForbiddenException, Injectable } from '@nestjs/common';
import { MediaType, SurveyRole } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import type { UploadedFileType } from 'src/common/types/uploaded-file.type';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadToSurvey(
    surveyId: string,
    userId: string,
    file: UploadedFileType,
  ) {
    const membership = await this.prisma.surveyMember.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId,
        },
      },
    });

    if (
      !membership ||
      membership.removedAt ||
      (membership.role !== SurveyRole.OWNER &&
        membership.role !== SurveyRole.EDITOR)
    ) {
      throw new ForbiddenException('Only OWNER or EDITOR can upload media');
    }

    const uploaded = await this.cloudinaryService.uploadFile(file, {
      folder: 'surveys',
      resourceType: 'auto',
    });
    const type = this.resolveMediaType(file.mimetype);

    return this.prisma.mediaAsset.create({
      data: {
        ownerId: userId,
        surveyId,
        type,
        url: uploaded.url,
        storageKey: uploaded.publicId,
        mimeType: file.mimetype,
        size: file.size,
      },
      select: {
        id: true,
        surveyId: true,
        url: true,
        storageKey: true,
      },
    });
  }

  private resolveMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    return MediaType.FILE;
  }
}
