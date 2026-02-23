import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'c6f4d31c-8baf-4e2e-9c6b-8ef47a3a11a2',
  })
  id: string;

  @ApiProperty({
    example: 'user@email.com',
  })
  email: string;

  @ApiProperty({
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    example: 'John Doe',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'https://cdn.app.com/avatar.png',
    required: false,
  })
  avatar?: string;
}
