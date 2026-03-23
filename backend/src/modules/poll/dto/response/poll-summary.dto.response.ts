import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PollStatus } from '@prisma/client';

export class PollSummaryDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  status: PollStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  totalVotes: number;

  @ApiProperty()
  createdAt: Date;
}
