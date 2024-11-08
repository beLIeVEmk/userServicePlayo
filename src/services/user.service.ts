import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { get, Model } from "mongoose";
import { RedisFunction } from "src/common/redisFunctions";
import UpdateProfileDto from "src/dto/updateprofile.dto";
import { UserDocument, UserModel } from "src/schema/user.schema";
import { CONSTANTS } from "src/utils/constants";
import { HelperFunctions } from "src/utils/helperFunctions";



@Injectable()
export class UserService{
    constructor(@InjectModel(UserModel) private readonly userModel:Model<UserDocument>,
                private readonly helperFunctions:HelperFunctions,
                private readonly redisFunction:RedisFunction
                ){}

    async getUserProfile(uuid:string){
        try {
            return await this.userModel.findById(uuid,{password:0});
        } catch (error) {
            throw error;
        }
    }

    async updateUserProfile(reqBody:UpdateProfileDto,uuid:string){
        try {
            let toUpdatePayload={}
            const userData=await this.getUserProfile(uuid);
            if(reqBody.oldEmail){
                if(reqBody.oldEmail!=userData.email){
                    throw new BadRequestException('Emails do not match')
                }
                if(reqBody.newEmail){
                    toUpdatePayload['email']=reqBody.newEmail
                }else{
                    throw new BadRequestException(CONSTANTS.msgValidation.email)
                }
            }
            if(reqBody.oldPassword){
                if(!await this.helperFunctions.checkPassword(reqBody.oldPassword,userData.password)){
                    throw new BadRequestException('Passwords do not match')
                }
                if(reqBody.newEmail){
                    toUpdatePayload['password']=reqBody.newPassword
                }else{
                    throw new BadRequestException(CONSTANTS.msgValidation.password)
                }
            }
            if(reqBody.address){
                toUpdatePayload['address']=reqBody.address
            }
            return await this.userModel.updateOne({_id:uuid},{...toUpdatePayload},{upsert:true});
        } catch (error) {
            throw error
        }
    }

    async deleteUserProfile(ownerId:string){
        try {
            const ownerOfGroups=await this.redisFunction.getAllHset(CONSTANTS.redisKeys.adminOfGroup(ownerId));
            if(ownerOfGroups){
                throw new BadRequestException('Make admin as other member or delete group created by you')
            }
            const ownerData=await this.userModel.deleteOne({_id:ownerId});
            if(ownerData.deletedCount==0){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest)
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}