import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { GlobalSearchDtoResponse } from './dto/response/global-search.dto.response';
import { SearchService } from './services/search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('global')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Global search across public surveys, polls, organizations, and users' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false })
  async globalSearch(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ): Promise<GlobalSearchDtoResponse> {
    const parsedLimit = limit ? Number(limit) : 6;
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 3), 20)
      : 6;
    return this.searchService.globalSearch(q ?? '', safeLimit);
  }
}
