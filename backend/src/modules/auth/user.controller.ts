import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { PublicUserProfileDtoResponse } from './dto/response/public-user-profile.dto.response';
import { UserProfileService } from './services/user-profile.service';
import { FileUploadInterceptor } from 'src/common/interceptors/file-upload.interceptor';
import type { UploadedFileType } from 'src/common/types/uploaded-file.type';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserResponseDto } from './dto/response/user-response.dto.response';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Public()
  @Get('public/:username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get public user profile' })
  @ApiResponse({ status: 200, type: PublicUserProfileDtoResponse })
  async getPublicProfile(
    @Param('username') username: string,
  ): Promise<PublicUserProfileDtoResponse> {
    return this.userProfileService.getPublicProfile(username);
  }

  @Post('me/avatar')
  @UseInterceptors(FileUploadInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateAvatar(
    @CurrentUser() user: { sub: string },
    @UploadedFile() file: UploadedFileType,
  ): Promise<UserResponseDto> {
    return this.userProfileService.updateAvatar(user.sub, file);
  }
}
