import { ApiProperty } from '@nestjs/swagger';
import { SurveyRole, SurveyStatus, SurveyVisibility } from '@prisma/client';

export class SurveySummaryDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty({ enum: SurveyStatus })
  status: SurveyStatus;

  @ApiProperty({ enum: SurveyVisibility })
  visibility: SurveyVisibility;

  @ApiProperty()
  allowAnonymous: boolean;

  @ApiProperty()
  randomizeQuestions: boolean;

  @ApiProperty({ required: false })
  organizationId?: string | null;

  @ApiProperty({ required: false })
  startsAt?: Date | null;

  @ApiProperty({ required: false })
  endsAt?: Date | null;

  @ApiProperty({ required: false })
  publishedAt?: Date | null;

  @ApiProperty({ enum: SurveyRole })
  role: SurveyRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
