import { Global, Module } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          url: configService.get<string>('UPSTASH_REDIS_REST_URL'),
          token: configService.get<string>('UPSTASH_REDIS_REST_TOKEN'),
        });
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
