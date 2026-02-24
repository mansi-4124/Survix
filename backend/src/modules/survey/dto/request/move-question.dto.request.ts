import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class MoveQuestionDtoRequest {
  @ApiProperty()
  @IsMongoId()
  targetPageId: string;
}
