import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class TransferOwnershipDtoRequest {
  @ApiProperty({
    description: 'New owner user ID (Mongo ObjectId)',
  })
  @IsString()
  @Matches(/^[a-fA-F0-9]{24}$/, {
    message: 'newOwnerUserId must be a valid Mongo ObjectId',
  })
  newOwnerUserId: string;
}

