import { ApiProperty } from '@nestjs/swagger';

export class StartResponseDtoResponse {
  @ApiProperty()
  responseId: string;
}
