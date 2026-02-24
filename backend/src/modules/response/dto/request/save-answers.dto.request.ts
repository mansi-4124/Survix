import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerItemDto {
  @ApiProperty()
  @IsMongoId()
  questionId: string;

  @ApiProperty({ type: Object })
  @IsObject()
  value: Record<string, unknown>;
}

export class SaveAnswersDtoRequest {
  @ApiProperty({ type: [AnswerItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
