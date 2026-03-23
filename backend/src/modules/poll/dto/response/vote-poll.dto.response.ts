import { ApiProperty } from '@nestjs/swagger';

export class VotePollDtoResponse {
  @ApiProperty()
  voteId: string;

  @ApiProperty()
  pollId: string;

  @ApiProperty()
  createdAt: Date;
}
