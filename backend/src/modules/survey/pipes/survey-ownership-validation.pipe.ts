import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateSurveyDtoRequest } from '../dto/request/create-survey.dto.request';
import { SurveyVisibility } from '@prisma/client';

@Injectable()
export class SurveyDateValidationPipe implements PipeTransform<
  CreateSurveyDtoRequest,
  CreateSurveyDtoRequest
> {
  transform(value: CreateSurveyDtoRequest): CreateSurveyDtoRequest {
    if (
      value.visibility === SurveyVisibility.PRIVATE &&
      value.allowAnonymous
    ) {
      throw new BadRequestException(
        'Private surveys cannot allow anonymous responses',
      );
    }

    if (value.startDate && value.endDate) {
      const startsAt = new Date(value.startDate);
      const endsAt = new Date(value.endDate);

      if (startsAt >= endsAt) {
        throw new BadRequestException('startDate must be before endDate');
      }
    }

    return value;
  }
}
