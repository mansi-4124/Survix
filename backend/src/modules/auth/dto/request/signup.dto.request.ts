import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { StrongPasswordField } from 'src/common/decorators/password.decorator';

export class SignupDto {
  @ApiProperty({
    example: 'user@email.com',
  })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'john_doe',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  username: string;

  @StrongPasswordField()
  password: string;
}
