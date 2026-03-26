import { ApiProperty } from '@nestjs/swagger';

export class GlobalSearchSurveyDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  visibility: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  allowAnonymous: boolean;

  @ApiProperty()
  randomizeQuestions: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class GlobalSearchPollDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  totalVotes: number;
}

export class GlobalSearchOrganizationDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  visibility: string;

  @ApiProperty()
  accountType: string;

  @ApiProperty({ required: false, nullable: true })
  logoUrl?: string | null;
}

export class GlobalSearchUserDtoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  username?: string | null;

  @ApiProperty({ required: false, nullable: true })
  name?: string | null;

  @ApiProperty({ required: false, nullable: true })
  avatar?: string | null;
}

export class GlobalSearchCountsDtoResponse {
  @ApiProperty()
  surveys: number;

  @ApiProperty()
  polls: number;

  @ApiProperty()
  organizations: number;

  @ApiProperty()
  users: number;
}

export class GlobalSearchDtoResponse {
  @ApiProperty({ type: [GlobalSearchSurveyDtoResponse] })
  surveys: GlobalSearchSurveyDtoResponse[];

  @ApiProperty({ type: [GlobalSearchPollDtoResponse] })
  polls: GlobalSearchPollDtoResponse[];

  @ApiProperty({ type: [GlobalSearchOrganizationDtoResponse] })
  organizations: GlobalSearchOrganizationDtoResponse[];

  @ApiProperty({ type: [GlobalSearchUserDtoResponse] })
  users: GlobalSearchUserDtoResponse[];

  @ApiProperty({ type: GlobalSearchCountsDtoResponse })
  counts: GlobalSearchCountsDtoResponse;
}
