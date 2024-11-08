import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Global, Module } from '@nestjs/common';
import { config } from 'src/common/config';


@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        url:config.db.redis.url
      }
    })
  ],
  exports:[RedisModule]
})
export class RedisDbModule {}