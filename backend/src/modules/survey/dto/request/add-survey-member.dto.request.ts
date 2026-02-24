import { ApiProperty } from '@nestjs/swagger';
import { SurveyRole } from '@prisma/client';
import { IsEnum, IsMongoId } from 'class-validator';

export class AddSurveyMemberDtoRequest {
  @ApiProperty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ enum: SurveyRole })
  @IsEnum(SurveyRole)
  role: SurveyRole;
}
