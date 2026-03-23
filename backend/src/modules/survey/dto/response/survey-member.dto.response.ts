import { ApiProperty } from '@nestjs/swagger';
import { SurveyRole } from '@prisma/client';

class SurveyMemberUserDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  username?: string | null;

  @ApiProperty({ required: false })
  name?: string | null;

  @ApiProperty({ required: false })
  avatar?: string | null;
}

export class SurveyMemberDtoResponse {
  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: SurveyRole })
  role: SurveyRole;

  @ApiProperty({ required: false })
  assignedAt?: Date | null;

  @ApiProperty({ required: false })
  removedAt?: Date | null;

  @ApiProperty({ type: SurveyMemberUserDtoResponse })
  user: SurveyMemberUserDtoResponse;
}
