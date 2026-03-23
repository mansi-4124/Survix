import { ApiPropertyOptional } from '@nestjs/swagger';
import { PollStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePollDtoRequest {
  @ApiPropertyOptional({ example: 'Updated poll title' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '2026-03-05T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ enum: PollStatus, example: PollStatus.LIVE })
  @IsOptional()
  @IsEnum(PollStatus)
  status?: PollStatus;

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
