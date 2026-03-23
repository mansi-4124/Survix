import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PollStatus, PollType } from '@prisma/client';

class PollWordCountDtoResponse {
  @ApiProperty()
  word: string;

  @ApiProperty()
  count: number;
}

class PollOptionResultDtoResponse {
  @ApiProperty()
  optionId: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  votes: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty({ enum: ['SURGE', 'TRENDING', 'LOSING', 'STABLE'] })
  momentum: 'SURGE' | 'TRENDING' | 'LOSING' | 'STABLE';
}

class PollParticipationDtoResponse {
  @ApiProperty()
  viewers: number;

  @ApiProperty()
  votes: number;

  @ApiProperty()
  participationPercent: number;
}

class PollQuestionResultDtoResponse {
  @ApiProperty()
  questionId: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: PollType })
  type: PollType;

  @ApiProperty()
  totalVotes: number;

  @ApiProperty({ type: [PollOptionResultDtoResponse] })
  optionResults: PollOptionResultDtoResponse[];

  @ApiProperty({ type: [PollWordCountDtoResponse] })
  wordCounts: PollWordCountDtoResponse[];

  @ApiPropertyOptional()
  surgeDetected?: boolean;
}

export class PollResultsDtoResponse {
  @ApiProperty()
  pollId: string;

  @ApiProperty()
  status: PollStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  timeRemainingMs: number;

  @ApiProperty()
  totalVotes: number;

  @ApiProperty({ type: [PollQuestionResultDtoResponse] })
  questions: PollQuestionResultDtoResponse[];

  @ApiProperty({ type: PollParticipationDtoResponse })
  participation: PollParticipationDtoResponse;
}
