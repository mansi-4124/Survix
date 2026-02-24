import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { UploadedFileType } from 'src/common/types/uploaded-file.type';

type UploadedAsset = {
  url: string;
  publicId: string;
};

@Injectable()
export class CloudinaryService {
  async uploadFile(file: UploadedFileType): Promise<UploadedAsset> {
    const publicId = randomUUID();
    const baseUrl = process.env.CLOUDINARY_PUBLIC_BASE_URL ?? 'https://res.cloudinary.com/local';
    const url = `${baseUrl}/${publicId}-${encodeURIComponent(file.originalname)}`;

    return {
      url,
      publicId,
    };
  }
}
