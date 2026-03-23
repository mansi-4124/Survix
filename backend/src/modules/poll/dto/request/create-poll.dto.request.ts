import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PollType } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePollDtoRequest {
  @ApiProperty({ example: '67bc7ed84799cfd093cc2903' })
  @IsMongoId()
  organizationId: string;

  @ApiProperty({ example: 'What feature should we ship next?' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({ example: 'Pick one option.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    type: [Object],
    example: [
      {
        text: 'What feature should we ship next?',
        type: PollType.MCQ,
        options: ['Realtime analytics', 'Export CSV', 'AI summaries'],
      },
      {
        text: 'One word to describe this sprint',
        type: PollType.ONE_WORD,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreatePollQuestionDtoRequest)
  questions: CreatePollQuestionDtoRequest[];

  @ApiPropertyOptional({ example: '2026-03-05T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({ example: '2026-03-05T11:00:00.000Z' })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allowMultipleVotes?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  showLiveResults?: boolean;
}

export class CreatePollQuestionDtoRequest {
  @ApiProperty({ example: 'What feature should we ship next?' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  text: string;

  @ApiProperty({ enum: PollType, example: PollType.MCQ })
  @IsEnum(PollType)
  type: PollType;

  @ApiPropertyOptional({
    type: [String],
    example: ['Realtime analytics', 'Export CSV', 'AI summaries'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  options?: string[];
}
