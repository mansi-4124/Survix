import { ApiProperty } from '@nestjs/swagger';
import { SurveyVisibility } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSurveyDtoRequest {
  @ApiProperty({ example: 'Customer Feedback' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title: string;

  @ApiProperty({ required: false, example: 'Q1 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, example: '67bc7ed84799cfd093cc2903' })
  @IsOptional()
  @IsMongoId()
  organizationId?: string;

  @ApiProperty({ enum: SurveyVisibility, example: SurveyVisibility.PUBLIC })
  @IsEnum(SurveyVisibility)
  visibility: SurveyVisibility;

  @ApiProperty({ example: true })
  @IsBoolean()
  allowAnonymous: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  allowMultipleResponses?: boolean;

  @ApiProperty({ required: false, example: '2026-02-24T18:10:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({ required: false, example: '2026-03-01T18:10:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;
}
