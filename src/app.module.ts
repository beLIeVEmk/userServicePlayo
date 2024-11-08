import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user.module';
import { GroupModule } from './modules/group.module';
import { RedisDbModule } from './database/redis.module';

@Module({
  imports: [UserModule,GroupModule,RedisDbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
