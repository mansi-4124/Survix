import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateSurveyDtoRequest } from '../dto/request/create-survey.dto.request';

@Injectable()
export class SurveyOwnershipValidationPipe implements PipeTransform<
  CreateSurveyDtoRequest,
  CreateSurveyDtoRequest
> {
  transform(value: CreateSurveyDtoRequest): CreateSurveyDtoRequest {
    if (value.startsAt && value.endsAt) {
      const startsAt = new Date(value.startsAt);
      const endsAt = new Date(value.endsAt);

      if (startsAt >= endsAt) {
        throw new BadRequestException('startsAt must be before endsAt');
      }
    }

    return value;
  }
}
