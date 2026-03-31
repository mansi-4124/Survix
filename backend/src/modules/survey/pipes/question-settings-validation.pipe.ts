import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { QuestionType } from '@prisma/client';
import { CreateQuestionDtoRequest } from '../dto/request/create-question.dto.request';

@Injectable()
export class QuestionSettingsValidationPipe implements PipeTransform<
  CreateQuestionDtoRequest,
  CreateQuestionDtoRequest
> {
  transform(value: CreateQuestionDtoRequest): CreateQuestionDtoRequest {
    const settings = value.settings ?? {};

    const typesNeedingOptions: QuestionType[] = [
      QuestionType.RADIO,
      QuestionType.CHECKBOX,
      QuestionType.RANKING,
    ];

    if (typesNeedingOptions.includes(value.type)) {
      const options = settings.options;

      if (
        !Array.isArray(options) ||
        options.length === 0 ||
        options.some(
          (option) => typeof option !== 'string' || !option.trim(),
        )
      ) {
        throw new BadRequestException(
          `settings.options is required for ${value.type}`,
        );
      }
    }

    if (value.type === QuestionType.RATING) {
      const scaleMin = settings.scaleMin;
      const scaleMax = settings.scaleMax;

      if (typeof scaleMin !== 'number' || typeof scaleMax !== 'number') {
        throw new BadRequestException(
          'settings.scaleMin and settings.scaleMax are required for RATING',
        );
      }
    }

    if (value.type === QuestionType.FILE_UPLOAD) {
      const maxFiles = settings.maxFiles;
      const maxSize = settings.maxSize;

      if (typeof maxFiles !== 'number' || typeof maxSize !== 'number') {
        throw new BadRequestException(
          'settings.maxFiles and settings.maxSize are required for FILE_UPLOAD',
        );
      }
    }

    return value;
  }
}
