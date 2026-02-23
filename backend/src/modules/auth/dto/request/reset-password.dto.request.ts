import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { StrongPasswordField } from 'src/common/decorators/password.decorator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User ID',
    example: 'c6f4d31c-8baf-4e2e-9c6b-8ef47a3a11a2',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Reset token sent via email',
  })
  @IsString()
  token: string;

  @StrongPasswordField()
  newPassword: string;
}
