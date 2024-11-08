
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/common/config';
import { GroupModel, GroupSchema } from 'src/schema/group.schema';
import { UserModel, UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [MongooseModule.forRoot(config.db.mongo.database.connectionString),
    MongooseModule.forFeature([{ name: UserModel, schema: UserSchema,collection:config.db.mongo.collections.user }]),
    MongooseModule.forFeature([{ name: GroupModel, schema: GroupSchema,collection:config.db.mongo.collections.group }]),
  ],
  exports:[MongooseModule]
})
export class MongoModule {}
