import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadedFileType } from 'src/common/types/uploaded-file.type';

type UploadedAsset = {
  url: string;
  publicId: string;
};

type UploadOptions = {
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
};

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private configured = false;

  private ensureConfigured() {
    if (this.configured) {
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException(
        'Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the backend environment.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    this.configured = true;
  }

  uploadFile(
    file: UploadedFileType,
    options: UploadOptions = {},
  ): Promise<UploadedAsset> {
    this.ensureConfigured();

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: options.resourceType ?? 'auto',
          folder: options.folder,
          public_id: options.publicId,
        },
        (error, result) => {
          if (error || !result) {
            if (error) {
              this.logger.error(
                `Cloudinary upload failed: ${error.message ?? error}`,
              );
            }
            if (error?.http_code === 401 || error?.http_code === 403) {
              return reject(
                new BadGatewayException(
                  'Cloudinary authentication failed. Verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
                ),
              );
            }
            return reject(
              new BadGatewayException(
                error?.message ?? 'Cloudinary upload failed',
              ),
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      upload.end(file.buffer);
    });
  }
}
