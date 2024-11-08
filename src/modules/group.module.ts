import { Module } from '@nestjs/common';
import { RedisFunction } from 'src/common/redisFunctions';
import { GroupController } from 'src/controllers/group.controller';
import { MongoModule } from 'src/database/mongo.module';
import { RedisDbModule } from 'src/database/redis.module';
import { GroupService } from 'src/services/group.service';
import { HelperFunctions } from 'src/utils/helperFunctions';


@Module({
  imports: [MongoModule,RedisDbModule],
  controllers: [GroupController],
  providers: [GroupService,HelperFunctions,RedisFunction],
})
export class GroupModule {}