import { Body, Controller, Get, HttpCode, Post,Headers, Query, UnauthorizedException, HttpStatus, Patch, Param, Delete } from '@nestjs/common';
import UpdateProfileDto from 'src/dto/updateprofile.dto';
import { UserService } from 'src/services/user.service';
import { HelperFunctions } from 'src/utils/helperFunctions';

@Controller('user')
export class UserController {

    constructor(
        private readonly helperFunctions:HelperFunctions,
        private readonly userService:UserService
    ){}

    @HttpCode(201)
    @Get('getUserInfo')
    async signUp(@Headers('authorization') jwtToken:string) {
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            const ownerDetails=await this.userService.getUserProfile(userData['_id']);
            return this.helperFunctions.createResObj(HttpStatus.OK,ownerDetails);
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Patch('updateProfile')
    async updateUserProfile(@Headers('Authorization') jwtToken:string,@Body() reqBody:UpdateProfileDto){
        try {
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            await this.helperFunctions.requestBodyValidation(UpdateProfileDto,reqBody);
            const updateUserDetails=await this.userService.updateUserProfile(reqBody,userData['_id']);
            return this.helperFunctions.createResObj(HttpStatus.OK,updateUserDetails);
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }

    @HttpCode(200)
    @Delete('deleteProfile')
    async deleteUserProfile(@Headers('Authorization') jwtToken:string){
        try {

            // he could hv been admin of groups
            // he have been part of some groups
            const userData=await this.helperFunctions.validateToken(jwtToken);
            if(userData.role!='user'){
                throw new UnauthorizedException('Not allowed to perform operation');
            }
            await this.userService.deleteUserProfile(userData['_id']);
            return this.helperFunctions.createResObj(HttpStatus.OK,{});
        } catch (error) {
            throw this.helperFunctions.createErrResBody(error);
        }
    }
}
