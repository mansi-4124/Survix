import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateQuestionDtoRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
