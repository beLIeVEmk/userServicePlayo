import { Controller, HttpCode, Post,Headers, Body, UnauthorizedException, HttpStatus, Delete, Query, Get, Patch, Put } from "@nestjs/common";
import CreateGroupDto from "src/dto/createGroup.dto";
import { GroupService } from "src/services/group.service";
import { HelperFunctions } from "src/utils/helperFunctions";

@Controller('group')
export class GroupController{

    constructor(
        private readonly helperFunctions:HelperFunctions,
        private readonly groupService:GroupService
    ){}
    @HttpCode(201)
    @Post('createGroup')
    async createGroup(@Headers('Authorization') jwtToken:string,@Body() reqBody:CreateGroupDto){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            const response=await this.groupService.createGroup(reqBody,userData['_id']);
            return this.helperFunctions.createResObj(HttpStatus.CREATED,response);
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Delete('deleteGroup')
    async deleteGroup(@Headers('Authorization') jwtToken:string,@Query('id') id:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            await this.groupService.deleteGroup(id,userData['_id']);
            return this.helperFunctions.createResObj(HttpStatus.OK,{});
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Get('getMyGroupInvites')
    async getMyGroupInvites(@Headers('Authorization') jwtToken:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            const response=await this.groupService.getGroupInvites(userData['_id']);
            return this.helperFunctions.createResObj(HttpStatus.OK,response)
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Get('getGroupInfo')
    async getGroupInfo(@Headers('Authorization') jwtToken:string,@Query('id') id:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            const groupDetails=await this.groupService.getGroupInfo(id);
            return this.helperFunctions.createResObj(HttpStatus.OK,groupDetails);
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Get('createdGroups')
    async getGroupByuser(@Headers('Authorization') jwtToken:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            const groupDetails=await this.groupService.groupCreateByAdmin(userData['_id']);
            return this.helperFunctions.createResObj(HttpStatus.OK,groupDetails);
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Patch('acceptGroupInvite')
    async acceptGroupInvite(@Headers('Authorization') jwtToken:string,@Query('id') id:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            await this.groupService.acceptGroupInvite(userData['_id'],id);
            return this.helperFunctions.createResObj(HttpStatus.OK,{});
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Put('deleteMember')
    async deleteMember(@Headers('Authorization') jwtToken:string,@Query('id') id:string,@Query('friendId') friendId:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            const response=await this.groupService.removeUserByAdmin(userData['_id'],friendId,id);
            return this.helperFunctions.createResObj(HttpStatus.OK,response);
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(201)
    @Put('sendIndividualInvite')
    async sendIndividualInvite(@Headers('Authorization') jwtToken:string,@Query('id') id:string,@Query('friendId') friendId:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            await this.groupService.sendIndividualInvite(userData['_id'],friendId,id);
            return this.helperFunctions.createResObj(HttpStatus.OK,{});
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Delete('rejectGroupInvite')
    async rejectGroupInvite(@Headers('Authorization') jwtToken:string,@Query('id') id:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            await this.groupService.rejectGroupInvite(userData['_id'],id);
            return this.helperFunctions.createResObj(HttpStatus.OK,{});
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Delete('leaveGroup')
    async leaveGroup(@Headers('Authorization') jwtToken:string,@Query('id') id:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            await this.groupService.leaveGroup(userData['_id'],id);
            return this.helperFunctions.createResObj(HttpStatus.OK,{});
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Patch('changeAdmin')
    async changeAdmin(@Headers('Authorization') jwtToken:string,@Query('id') id:string,@Query('friendId') friendId:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            await this.groupService.changeAdmin(userData['_id'],friendId,id);
            return this.helperFunctions.createResObj(HttpStatus.OK,{});
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);   
        }
    }

    @HttpCode(200)
    @Patch('changeGroupName')
    async changeGroupName(@Headers('Authorization') jwtToken:string,@Query('id') id:string,@Query('name') name:string){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            const response=await this.groupService.changeName(userData['_id'],id,name);
            return this.helperFunctions.createResObj(HttpStatus.OK,response);
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }
}