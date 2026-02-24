import { ApiProperty } from '@nestjs/swagger';
import { SurveyVisibility } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSurveyDtoRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, enum: SurveyVisibility })
  @IsOptional()
  @IsEnum(SurveyVisibility)
  visibility?: SurveyVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @ApiProperty({ required: false, example: '2026-02-24T18:10:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({ required: false, example: '2026-03-01T18:10:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;
}
