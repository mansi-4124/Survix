import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsMongoId } from 'class-validator';

export class ReorderQuestionsDtoRequest {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  orderedQuestionIds: string[];
}
