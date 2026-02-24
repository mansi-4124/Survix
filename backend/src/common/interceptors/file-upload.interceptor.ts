import { Type, mixin } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export function FileUploadInterceptor(fieldName = 'file'): Type<any> {
  class InterceptorMixin extends FileInterceptor(fieldName, {
    storage: memoryStorage(),
    limits: {
      fileSize: 15 * 1024 * 1024,
    },
  }) {}

  return mixin(InterceptorMixin);
}
