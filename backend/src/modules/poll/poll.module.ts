import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { RedisModule } from 'src/common/redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { PollController } from './poll.controller';
import { PollGateway } from './gateways/poll.gateway';
import { PollOrganizationMemberGuard } from './guards/poll-organization-member.guard';
import { PollRealtimeService } from './services/poll-realtime.service';
import { PollService } from './services/poll.service';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule],
  controllers: [PollController],
  providers: [
    PollService,
    PollRealtimeService,
    PollOrganizationMemberGuard,
    PollGateway,
  ],
  exports: [PollService],
})
export class PollModule {}
