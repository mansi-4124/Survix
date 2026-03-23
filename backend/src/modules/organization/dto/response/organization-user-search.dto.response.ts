import { ApiProperty } from '@nestjs/swagger';

export class OrganizationUserSearchDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  username?: string | null;

  @ApiProperty({ required: false })
  name?: string | null;

  @ApiProperty({ required: false })
  avatar?: string | null;
}
