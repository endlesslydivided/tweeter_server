import { Module } from '@nestjs/common';
import * as Redis from 'redis';

export const REDIS = Symbol('AUTH:REDIS');

@Module({
  providers: [
    {
      provide: REDIS,
      useValue: Redis.createClient({
        url:process.env.REDIS_URL
      }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}