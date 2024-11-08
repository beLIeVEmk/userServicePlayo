import { Module } from '@nestjs/common';
import { RedisFunction } from 'src/common/redisFunctions';
import { UserController } from 'src/controllers/user.controller';
import { MongoModule } from 'src/database/mongo.module';
import { RedisDbModule } from 'src/database/redis.module';
import { UserService } from 'src/services/user.service';
import { HelperFunctions } from 'src/utils/helperFunctions';


@Module({
  imports: [MongoModule,RedisDbModule],
  controllers: [UserController],
  providers: [UserService,HelperFunctions,RedisFunction],
})
export class UserModule {}