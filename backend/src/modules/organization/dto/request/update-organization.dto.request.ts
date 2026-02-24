import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OrganizationVisibility } from '@prisma/client';

export class UpdateOrganizationDtoRequest {
  @ApiPropertyOptional({
    example: 'Acme Inc',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    required: false,
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    required: false,
  })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  contactEmail?: string;

  @ApiPropertyOptional({
    enum: OrganizationVisibility,
  })
  @IsOptional()
  @IsEnum(OrganizationVisibility)
  visibility?: OrganizationVisibility;
}

