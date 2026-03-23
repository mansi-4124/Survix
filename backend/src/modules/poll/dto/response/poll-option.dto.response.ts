import { ApiProperty } from '@nestjs/swagger';

export class PollOptionDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;
}
