import { ApiProperty } from '@nestjs/swagger';
import { SurveyStatus } from '@prisma/client';

export class CreateSurveyDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: SurveyStatus })
  status: SurveyStatus;

  @ApiProperty()
  publicLink: string;
}
