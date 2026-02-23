import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export function StrongPasswordField() {
  return applyDecorators(
    ApiProperty({
      description: 'User password',
      minLength: 8,
      maxLength: 64,
      example: 'StrongPassword123!',
    }),
    IsString(),
    MinLength(8),
    MaxLength(64),
    Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    }),
  );
}
