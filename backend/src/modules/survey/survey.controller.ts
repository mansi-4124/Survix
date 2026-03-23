import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { Public } from '../auth/decorators/public.decorator';
import type { TokenPayload } from '../auth/domain/types/token-payload.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { OrganizationMemberGuard } from '../organization/guards/organization-member.guard';
import { AddSurveyMemberDtoRequest } from './dto/request/add-survey-member.dto.request';
import { CreateQuestionDtoRequest } from './dto/request/create-question.dto.request';
import { CreateSurveyPageDtoRequest } from './dto/request/create-survey-page.dto.request';
import { CreateSurveyDtoRequest } from './dto/request/create-survey.dto.request';
import { MoveQuestionDtoRequest } from './dto/request/move-question.dto.request';
import { ReorderQuestionsDtoRequest } from './dto/request/reorder-questions.dto.request';
import { UpdateQuestionDtoRequest } from './dto/request/update-question.dto.request';
import { UpdateSurveyPageDtoRequest } from './dto/request/update-survey-page.dto.request';
import { UpdateSurveyDtoRequest } from './dto/request/update-survey.dto.request';
import { CreateSurveyDtoResponse } from './dto/response/create-survey.dto.response';
import { PublicSurveyDtoResponse } from './dto/response/public-survey.dto.response';
import { RevisionDtoResponse } from './dto/response/revision.dto.response';
import { SurveyMemberDtoResponse } from './dto/response/survey-member.dto.response';
import { SurveyQuestionDtoResponse } from './dto/response/survey-question.dto.response';
import { SurveySummaryDtoResponse } from './dto/response/survey-summary.dto.response';
import { SurveyAccessGuard } from './guards/survey-access.guard';
import { SurveyEditGuard } from './guards/survey-edit.guard';
import { QuestionSettingsValidationPipe } from './pipes/question-settings-validation.pipe';
import { SurveyOwnershipValidationPipe } from './pipes/survey-ownership-validation.pipe';
import { SurveyService } from './services/survey.service';

@ApiTags('Surveys')
@ApiBearerAuth()
@Controller()
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post('surveys')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async createSurvey(
    @Body(SurveyOwnershipValidationPipe) dto: CreateSurveyDtoRequest,
    @CurrentUser() user: TokenPayload,
  ): Promise<CreateSurveyDtoResponse> {
    return this.surveyService.createSurvey(user.sub, dto);
  }

  @Get('surveys/my')
  @UseGuards(JwtAuthGuard)
  async getMySurveys(
    @CurrentUser() user: TokenPayload,
  ): Promise<SurveySummaryDtoResponse[]> {
    return this.surveyService.getMySurveys(user.sub);
  }

  @Patch('surveys/:surveyId')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async updateSurvey(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @Body() dto: UpdateSurveyDtoRequest,
  ): Promise<RevisionDtoResponse> {
    return this.surveyService.updateSurvey(surveyId, dto);
  }

  @Post('surveys/:surveyId/publish')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard)
  async publishSurvey(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<{ status: string }> {
    return this.surveyService.publishSurvey(surveyId, user.sub);
  }

  @Post('surveys/:surveyId/close')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard)
  async closeSurvey(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<{ status: string }> {
    return this.surveyService.closeSurvey(surveyId, user.sub);
  }

  @Delete('surveys/:surveyId')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard)
  async softDeleteSurvey(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<void> {
    await this.surveyService.softDeleteSurvey(surveyId, user.sub);
  }

  @Post('surveys/:surveyId/duplicate')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard)
  async duplicateSurvey(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<{ newSurveyId: string }> {
    return this.surveyService.duplicateSurvey(surveyId, user.sub);
  }

  @Public()
  @Get('surveys/public')
  @UseGuards(OptionalJwtAuthGuard)
  async searchPublicSurveys(
    @Query('search') search: string | undefined,
    @CurrentUser() user?: TokenPayload,
  ): Promise<PublicSurveyDtoResponse[]> {
    return this.surveyService.searchPublicSurveys(search, user);
  }

  @Public()
  @Get('surveys/:surveyId')
  @UseGuards(OptionalJwtAuthGuard, SurveyAccessGuard)
  async getSurveyForView(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
  ) {
    return this.surveyService.getSurveyForView(surveyId);
  }

  @Post('surveys/:surveyId/members')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard)
  async addMember(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @Body() dto: AddSurveyMemberDtoRequest,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.surveyService.addOrUpdateMember(
      surveyId,
      user.sub,
      dto.userId,
      dto.role,
    );
  }

  @Post('surveys/:surveyId/pages')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async createPage(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateSurveyPageDtoRequest,
  ): Promise<{ id: string; order: number }> {
    return this.surveyService.createPage(surveyId, user.sub, dto);
  }

  @Get('surveys/:surveyId/members')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard)
  async listMembers(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<SurveyMemberDtoResponse[]> {
    return this.surveyService.listMembers(surveyId, user.sub);
  }

  @Delete('surveys/:surveyId/members/:userId')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard)
  async removeMember(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<void> {
    await this.surveyService.removeMember(surveyId, user.sub, userId);
  }

  @Post('pages/:pageId/questions')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async createQuestion(
    @Param('pageId', ParseObjectIdPipe) pageId: string,
    @CurrentUser() user: TokenPayload,
    @Body(QuestionSettingsValidationPipe) dto: CreateQuestionDtoRequest,
  ): Promise<{ id: string; order: number }> {
    return this.surveyService.createQuestion(pageId, user.sub, dto);
  }

  @Patch('questions/:questionId')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async updateQuestion(
    @Param('questionId', ParseObjectIdPipe) questionId: string,
    @Body() dto: UpdateQuestionDtoRequest,
  ) {
    return this.surveyService.updateQuestion(questionId, dto);
  }

  @Delete('questions/:questionId')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async deleteQuestion(
    @Param('questionId', ParseObjectIdPipe) questionId: string,
  ): Promise<void> {
    await this.surveyService.deleteQuestion(questionId);
  }

  @Patch('pages/:pageId')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async updatePage(
    @Param('pageId', ParseObjectIdPipe) pageId: string,
    @Body() dto: UpdateSurveyPageDtoRequest,
  ) {
    return this.surveyService.updatePage(pageId, dto);
  }

  @Delete('pages/:pageId')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async deletePage(
    @Param('pageId', ParseObjectIdPipe) pageId: string,
  ): Promise<void> {
    await this.surveyService.deletePage(pageId);
  }

  @Post('pages/:pageId/questions/reorder')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async reorderQuestions(
    @Param('pageId', ParseObjectIdPipe) pageId: string,
    @Body() dto: ReorderQuestionsDtoRequest,
  ): Promise<{ message: string }> {
    return this.surveyService.reorderQuestions(pageId, dto);
  }

  @Post('questions/:questionId/move')
  @UseGuards(JwtAuthGuard, SurveyAccessGuard, SurveyEditGuard)
  async moveQuestion(
    @Param('questionId', ParseObjectIdPipe) questionId: string,
    @Body() dto: MoveQuestionDtoRequest,
    @CurrentUser() user: TokenPayload,
  ): Promise<void> {
    await this.surveyService.moveQuestion(questionId, dto, user.sub);
  }

  @Get('pages/:pageId/questions')
  @UseGuards(SurveyAccessGuard)
  async getQuestions(
    @Param('pageId', ParseObjectIdPipe) pageId: string,
  ): Promise<SurveyQuestionDtoResponse[]> {
    return this.surveyService.getQuestions(pageId);
  }

  @Public()
  @Get('surveys/:surveyId/structure')
  @UseGuards(OptionalJwtAuthGuard, SurveyAccessGuard)
  async getSurveyStructure(
    @Param('surveyId', ParseObjectIdPipe) surveyId: string,
  ) {
    return this.surveyService.getSurveyStructure(surveyId, true);
  }
}
