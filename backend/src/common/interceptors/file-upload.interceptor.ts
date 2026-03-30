import { BadRequestException, Type, mixin } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

type FileUploadOptions = {
  maxSize?: number;
  allowedMimeTypes?: string[];
};

export function FileUploadInterceptor(
  fieldName = 'file',
  options: FileUploadOptions = {},
): Type<any> {
  class InterceptorMixin extends FileInterceptor(fieldName, {
    storage: memoryStorage(),
    limits: {
      fileSize: options.maxSize ?? 15 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
      if (
        options.allowedMimeTypes &&
        !options.allowedMimeTypes.includes(file.mimetype)
      ) {
        return callback(
          new BadRequestException('Unsupported file type'),
          false,
        );
      }
      callback(null, true);
    },
  }) {}

  return mixin(InterceptorMixin);
}
