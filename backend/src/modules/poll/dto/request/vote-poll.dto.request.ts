import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class VotePollDtoRequest {
  @ApiProperty({ example: '67bc7ed84799cfd093cc2905' })
  @IsMongoId()
  questionId: string;

  @ApiPropertyOptional({ example: '67bc7ed84799cfd093cc2904' })
  @IsOptional()
  @IsMongoId()
  optionId?: string;

  @ApiPropertyOptional({ example: 'analytics' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[^\s]+$/, { message: 'wordAnswer must be a single word' })
  wordAnswer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  @ApiPropertyOptional({
    description:
      'Deprecated/ignored. Anonymous vote deduping uses a server-issued identifier.',
    example: '9f8f2b9d-4d8e-4b1b-8f53-6ec9bff0d866',
  })
  sessionId?: string;

  @ApiPropertyOptional({ example: 'Alex' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  participantName?: string;
}
