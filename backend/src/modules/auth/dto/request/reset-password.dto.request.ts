import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { StrongPasswordField } from 'src/common/decorators/password.decorator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User ID (Mongo ObjectId)',
    example: '60f7f0b3b4d1c2a5f8e9a123',
  })
  @Matches(/^[a-fA-F0-9]{24}$/, {
    message: 'userId must be a valid Mongo ObjectId',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Reset token sent via email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @StrongPasswordField()
  newPassword: string;
}
