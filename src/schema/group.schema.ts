import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
const bcrypt = require('bcrypt');

@Schema({versionKey:false})
class Group{
    @Prop({required:true})
    groupName:string

    @Prop({required:false})
    adminId:string

    @Prop({required:true})
    groupList:Array<String>
    
    @Prop({required:false})
    groupSize:number
}

export type GroupDocument=Document & Group

export const GroupSchema=SchemaFactory.createForClass(Group)

export const GroupModel=Group.name