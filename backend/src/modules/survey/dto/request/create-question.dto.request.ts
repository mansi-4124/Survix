import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateQuestionDtoRequest {
  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ example: 'How satisfied are you?' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
