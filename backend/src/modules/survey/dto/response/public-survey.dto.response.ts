import { ApiProperty } from '@nestjs/swagger';
import { SurveyVisibility } from '@prisma/client';

export class PublicSurveyDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty({ enum: SurveyVisibility })
  visibility: SurveyVisibility;

  @ApiProperty()
  allowAnonymous: boolean;

  @ApiProperty()
  randomizeQuestions: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  hasResponded: boolean;
}
