import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { Public } from '../auth/decorators/public.decorator';
import type { TokenPayload } from '../auth/domain/types/token-payload.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CreatePollDtoRequest } from './dto/request/create-poll.dto.request';
import { UpdatePollDtoRequest } from './dto/request/update-poll.dto.request';
import { VotePollDtoRequest } from './dto/request/vote-poll.dto.request';
import { PollDetailsDtoResponse } from './dto/response/poll-details.dto.response';
import { PollResultsDtoResponse } from './dto/response/poll-results.dto.response';
import { PollSummaryDtoResponse } from './dto/response/poll-summary.dto.response';
import { VotePollDtoResponse } from './dto/response/vote-poll.dto.response';
import { PollOrganizationMemberGuard } from './guards/poll-organization-member.guard';
import { PollService } from './services/poll.service';

@ApiTags('Polls')
@ApiBearerAuth()
@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post()
  @UseGuards(PollOrganizationMemberGuard)
  async createPoll(
    @Body() dto: CreatePollDtoRequest,
    @CurrentUser() user: TokenPayload,
  ): Promise<PollDetailsDtoResponse> {
    return this.pollService.createPoll(dto, user);
  }

  @Get('my')
  async listMyPolls(
    @CurrentUser() user: TokenPayload,
    @Query('organizationId') organizationId?: string,
  ): Promise<PollSummaryDtoResponse[]> {
    return this.pollService.listMyPolls(user.sub, organizationId);
  }

  @Get(':pollId')
  @UseGuards(PollOrganizationMemberGuard)
  async getPollForManagement(
    @Param('pollId', ParseObjectIdPipe) pollId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<PollDetailsDtoResponse> {
    return this.pollService.getPollForManagement(pollId, user.sub);
  }

  @Patch(':pollId')
  @UseGuards(PollOrganizationMemberGuard)
  async updatePoll(
    @Param('pollId', ParseObjectIdPipe) pollId: string,
    @Body() dto: UpdatePollDtoRequest,
    @CurrentUser() user: TokenPayload,
  ): Promise<PollDetailsDtoResponse> {
    return this.pollService.updatePoll(pollId, dto, user.sub);
  }

  @Delete(':pollId')
  @UseGuards(PollOrganizationMemberGuard)
  async deletePoll(
    @Param('pollId', ParseObjectIdPipe) pollId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<{ status: string }> {
    return this.pollService.deletePoll(pollId, user.sub);
  }

  @Post(':pollId/close')
  @UseGuards(PollOrganizationMemberGuard)
  async closePoll(
    @Param('pollId', ParseObjectIdPipe) pollId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<{ status: string }> {
    return this.pollService.closePoll(pollId, user.sub);
  }

  @Public()
  @Get(':pollId/live')
  async getPollForLiveView(
    @Param('pollId', ParseObjectIdPipe) pollId: string,
  ): Promise<PollDetailsDtoResponse> {
    return this.pollService.getPollForLiveView(pollId);
  }

  @Public()
  @Get('code/:code/live')
  async getPollForJoinByCode(
    @Param('code') code: string,
  ): Promise<PollDetailsDtoResponse> {
    return this.pollService.getPollForJoinByCode(code);
  }

  @Public()
  @Get(':pollId/results')
  async getPollResults(
    @Param('pollId', ParseObjectIdPipe) pollId: string,
  ): Promise<PollResultsDtoResponse> {
    return this.pollService.getPollResults(pollId);
  }

  @Public()
  @Post(':pollId/votes')
  @UseGuards(OptionalJwtAuthGuard)
  async submitVote(
    @Param('pollId', ParseObjectIdPipe) pollId: string,
    @Body() dto: VotePollDtoRequest,
    @CurrentUser() user: TokenPayload | undefined,
    @Req() req: Request,
  ): Promise<VotePollDtoResponse> {
    return this.pollService.submitVote(pollId, dto, user, req.anonymousId);
  }

  @Get(':pollId/responses/csv')
  @UseGuards(PollOrganizationMemberGuard)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="poll-responses.csv"')
  async downloadPollResponsesCsv(
    @Param('pollId', ParseObjectIdPipe) pollId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<string> {
    return this.pollService.exportPollResponsesCsv(pollId, user.sub);
  }
}
