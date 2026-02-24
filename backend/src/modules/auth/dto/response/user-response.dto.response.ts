import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: '60f7f0b3b4d1c2a5f8e9a123',
  })
  id: string;

  @ApiProperty({
    example: 'user@email.com',
  })
  email: string;

  @ApiProperty({
    example: 'john_doe',
    required: false,
  })
  username?: string | null;

  @ApiProperty({
    example: 'John Doe',
    required: false,
  })
  name?: string | null;

  @ApiProperty({
    example: 'https://cdn.app.com/avatar.png',
    required: false,
  })
  avatar?: string | null;
}
