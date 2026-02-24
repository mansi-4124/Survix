import { ApiProperty } from '@nestjs/swagger';

export class RevisionDtoResponse {
  @ApiProperty()
  revision: number;
}
