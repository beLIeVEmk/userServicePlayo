import { BadRequestException, HttpCode, Injectable, Put } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isValidObjectId, Model } from "mongoose";
import { RedisFunction } from "src/common/redisFunctions";
import CreateGroupDto from "src/dto/createGroup.dto";
import { GroupDocument, GroupModel } from "src/schema/group.schema";
import { CONSTANTS } from "src/utils/constants";
import { HelperFunctions } from "src/utils/helperFunctions";


@Injectable()
export class GroupService{

    constructor(@InjectModel(GroupModel) private readonly groupModel:Model<GroupDocument>,
                private readonly helperFunctions:HelperFunctions,
                private readonly redisFunction:RedisFunction
                ){}

    
    async createGroup(reqBody:CreateGroupDto,uuid:string){
        try {
            if(await this.groupModel.findOne({$and:[{adminId:uuid,groupName:reqBody.groupName}]})){
                throw new BadRequestException(CONSTANTS.msgValidation.duplicateGroupName);
            }
            reqBody['groupSize']=1;
            reqBody['adminId']=uuid;
            const friendList=reqBody.groupList;
            reqBody.groupList=[];
            const response=await this.groupModel.create(reqBody);
            for(let friendId of friendList){
                await this.redisFunction.redisHashSet(CONSTANTS.redisKeys.userInvitation(friendId),`${response._id}`,`not_accepted`)
            }
            await this.redisFunction.setRedis(`${response._id}`,JSON.stringify(friendList));
            await this.redisFunction.redisHashSet(CONSTANTS.redisKeys.adminOfGroup(uuid),JSON.stringify([response._id]),'admin');
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getGroupInfo(groupId:string){
        try {
            if(!isValidObjectId(groupId)){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest)
            }
            const response=await this.groupModel.findById(groupId);
            if(!response){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest);
            }
            return response;
        } catch (error) {
            throw error;
        }
    }
    async deleteGroup(groupId:string,ownerId:string){
        try {
            const groupInfo=await this.getGroupInfo(groupId);
            if(groupInfo.adminId!=ownerId){
                throw new BadRequestException(CONSTANTS.msgValidation.adminCanOnlyDelete)
            }
            let redisGroupList=await this.redisFunction.getRedis(groupId);
            for(let friendId of redisGroupList){
                await this.redisFunction.delRedisHasSet(CONSTANTS.redisKeys.userInvitation(friendId),groupId);
            }
            await this.redisFunction.deleteRedisKey(groupId);
            // toDo : delete bookings created by this group in future time
            const response=await this.groupModel.deleteOne({_id:groupId});
            if(response.deletedCount==1){
                await this.redisFunction.deleteRedisKey(groupId);
            }else{
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest);
            }
            const redisAdminGroup=CONSTANTS.redisKeys.adminOfGroup(ownerId);
            await this.redisFunction.delRedisHasSet(redisAdminGroup,groupId);
        } catch (error) {
            throw error;
        }
    }

    async groupCreateByAdmin(uuId:string){
        try {
            return await this.groupModel.find({adminId:uuId});
        } catch (error) {
            throw error
        }
    }

    async acceptGroupInvite(uuid:string,groupId:string){
        try {
            let groupInfo=await this.getGroupInfo(groupId);
            if(!groupInfo){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest);
            }
            if(await this.redisFunction.checkPresenceInHset(CONSTANTS.redisKeys.userInvitation(uuid),groupId)){
                await this.redisFunction.delRedisHasSet(CONSTANTS.redisKeys.userInvitation(uuid),groupId);
                let groupList=JSON.parse(await this.redisFunction.getRedis(groupId));
                groupList=groupList.filter((friendId)=>{
                    return friendId!=uuid;
                })
                if(groupList.length==0){
                    await this.redisFunction.deleteRedisKey(groupId);
                }else{
                    await this.redisFunction.setRedis(groupId,JSON.stringify(groupList));
                }
                

            }else{
                throw new BadRequestException(CONSTANTS.msgValidation.notInvited)
            }
            groupInfo.groupList.push(uuid);
            groupInfo.groupSize+=1;
            await groupInfo.save();
        } catch (error) {
            throw error;
        }
    }

    async getGroupInvites(uuid:string){
        try {
            return await this.redisFunction.getAllHset(CONSTANTS.redisKeys.userInvitation(uuid));
        } catch (error) {
            throw error;
        }
    }

    // remove member - by group admin
    async removeUserByAdmin(adminId:string,friendId:string,groupId:string){
        try {

            // delete user and delete the friendrequest too
            let groupInfo=await this.getGroupInfo(groupId);
            if(adminId!=groupInfo.adminId){
                throw new BadRequestException(CONSTANTS.msgValidation.adminsOnlyCanRemove);
            }
            let currentGroupSize=groupInfo.groupList.length;
            groupInfo.groupList=groupInfo.groupList.filter((uuid)=>{return friendId!=uuid});
            if(groupInfo.groupList.length==currentGroupSize){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest);
            }
            groupInfo.groupSize-=1;
            return await groupInfo.save();
        } catch (error) {
            throw error;
        }
    }

    async sendIndividualInvite(adminId:string,friendId:string,groupId:string){
        try {
            const groupInfo=await this.getGroupInfo(groupId);
            if(!groupInfo){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest);
            }
            if(groupInfo.adminId!=adminId){
                throw new BadRequestException(CONSTANTS.msgValidation.adminsCanSendReq);
            }
            if(groupInfo.groupList.indexOf(friendId)!=-1){
                throw new BadRequestException(CONSTANTS.msgValidation.alreadyInGroup)
            }
            let redisGroupList=JSON.parse(await this.redisFunction.getRedis(groupId));
            if(!redisGroupList){
                await this.redisFunction.setRedis(groupId,JSON.stringify([friendId]));
            }else{
                redisGroupList.push(friendId);
                await this.redisFunction.setRedis(groupId,JSON.stringify(redisGroupList));
            }
            await this.redisFunction.redisHashSet(CONSTANTS.redisKeys.userInvitation(friendId),groupId,'not_accepted');
        } catch (error) {
            throw error;
        }
    }

    async rejectGroupInvite(uuid:string,groupId:string){
        try {
            const groupInfo=await this.getGroupInfo(groupId);
            if(!groupInfo){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest);
            }
            await this.redisFunction.delRedisHasSet(CONSTANTS.redisKeys.userInvitation(uuid),groupId);
            let redisGroupList=JSON.parse(await this.redisFunction.getRedis(groupId));
            if(redisGroupList){
                redisGroupList=redisGroupList.filter((id)=>{return uuid!=id});
                await this.redisFunction.setRedis(groupId,JSON.stringify(redisGroupList));
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    async leaveGroup(uuid:string,groupId:string){
        try {
            let groupInfo=await this.getGroupInfo(groupId);
            if(!groupInfo){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest);
            }
            if(groupInfo.adminId==uuid){
                throw new BadRequestException(CONSTANTS.msgValidation.makeOtherAdmin);
            }
            let curSize=groupInfo.groupList.length;
            groupInfo.groupList=groupInfo.groupList.filter((id)=>{id!=uuid});
            if(curSize==groupInfo.groupList.length){
                throw new BadRequestException(CONSTANTS.msgValidation.doesNotBelongToGroup);
            }
            groupInfo.groupSize-=1;
            await groupInfo.save();
        } catch (error) {
            throw error;
        }
    }

    async changeAdmin(adminId:string,friendId:string,groupId:string){
        try {
            let groupInfo=await this.getGroupInfo(groupId);
            if(!groupInfo){
                throw new BadRequestException(CONSTANTS.msgValidation.invalidRequest);
            }
            if(groupInfo.adminId!=adminId){
                throw new BadRequestException(CONSTANTS.msgValidation.cantDoAdminOps);
            }
            let curSize=groupInfo.groupSize;
            groupInfo.groupList=groupInfo.groupList.filter((id)=>{id!=friendId});
            if(curSize==groupInfo.groupList.length){
                throw new BadRequestException(CONSTANTS.msgValidation.doesNotBelongToGroup);
            }
            const redisAdminGroup=CONSTANTS.redisKeys.adminOfGroup(adminId);
            const redisToBeAdminGroup=CONSTANTS.redisKeys.adminOfGroup(friendId);
            await this.redisFunction.delRedisHasSet(redisAdminGroup,groupId);
            await this.redisFunction.redisHashSet(redisToBeAdminGroup,groupId,'admin');
            groupInfo.groupList.push(adminId);
            groupInfo.adminId=friendId;
            await groupInfo.save();
        } catch (error) {
            throw error;
        }
    }

    async changeName(uuid,groupId:string,newName:string) {
        try {
            if(await this.groupModel.findOne({adminId:uuid,groupName:newName})){
                throw new BadRequestException(CONSTANTS.msgValidation.duplicateGroupName);
            }
            return await this.groupModel.updateOne({_id:groupId},{groupName:newName});
        } catch (error) {
            throw error;
        }
    }
}