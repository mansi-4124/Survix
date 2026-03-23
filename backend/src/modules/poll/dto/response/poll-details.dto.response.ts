import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PollStatus, PollType } from '@prisma/client';
import { PollOptionDtoResponse } from './poll-option.dto.response';

export class PollQuestionDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: PollType })
  type: PollType;

  @ApiProperty({ type: [PollOptionDtoResponse] })
  options: PollOptionDtoResponse[];
}

export class PollDetailsDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  status: PollStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  allowAnonymous: boolean;

  @ApiProperty()
  allowMultipleVotes: boolean;

  @ApiProperty()
  showLiveResults: boolean;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [PollQuestionDtoResponse] })
  questions: PollQuestionDtoResponse[];
}
