import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';

export class SurveyQuestionDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  text: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty({ required: false, type: Object })
  settings?: Record<string, unknown> | null;
}
