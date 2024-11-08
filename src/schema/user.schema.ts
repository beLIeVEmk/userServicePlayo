import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
const bcrypt = require('bcrypt');

@Schema({versionKey:false})
class User{
    @Prop({required:true})
    name:string

    @Prop({required:false})
    password:string

    @Prop({required:true,unique:true})
    email:string
    
    @Prop({required:false})
    address:string

    @Prop({required:true})
    role:string
}

export type UserDocument=Document & User

export const UserSchema=SchemaFactory.createForClass(User)

export const UserModel=User.name

UserSchema.pre('save', function(next)  {
    bcrypt.hash(this.password, 10, (error, hash)=> {
      if (error) {
        return next(error);
      } else {
        this.password = hash;
        next();
      }
    });
});