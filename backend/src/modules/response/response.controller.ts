import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { Public } from '../auth/decorators/public.decorator';
import type { TokenPayload } from '../auth/domain/types/token-payload.type';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { SurveyAccessGuard } from '../survey/guards/survey-access.guard';
import { SaveAnswersDtoRequest } from './dto/request/save-answers.dto.request';
import { StartResponseDtoResponse } from './dto/response/start-response.dto.response';
import { ResponseAccessGuard } from './guards/response-access.guard';
import { ResponseService } from './services/response.service';

@ApiTags('Responses')
@ApiBearerAuth()
@Controller()
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Public()
  @Post('surveys/:surveyId/responses/start')
  @UseGuards(OptionalJwtAuthGuard, SurveyAccessGuard)
  async startResponse(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @CurrentUser() user: TokenPayload | undefined,
    @Req() req: Request,
  ): Promise<StartResponseDtoResponse> {
    return this.responseService.startResponse(
      surveyId,
      user?.sub,
      req.anonymousId,
    );
  }

  @Public()
  @Post('responses/:responseId/answers')
  @UseGuards(OptionalJwtAuthGuard, ResponseAccessGuard)
  async saveAnswers(
    @Param('responseId', ParseObjectIdPipe) responseId: string,
    @Body() dto: SaveAnswersDtoRequest,
  ): Promise<void> {
    await this.responseService.saveAnswers(responseId, dto);
  }

  @Public()
  @Post('responses/:responseId/submit')
  @UseGuards(OptionalJwtAuthGuard, ResponseAccessGuard)
  async submitResponse(
    @Param('responseId', ParseObjectIdPipe) responseId: string,
  ): Promise<void> {
    await this.responseService.submitResponse(responseId);
  }

  @Post('responses/:responseId/reopen')
  async reopenResponse(
    @Param('responseId', ParseObjectIdPipe) responseId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<void> {
    await this.responseService.reopenResponse(responseId, user.sub);
  }

  @Delete('responses/:responseId')
  async softDeleteResponse(
    @Param('responseId', ParseObjectIdPipe) responseId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<void> {
    await this.responseService.deleteResponse(responseId, user.sub);
  }
}
