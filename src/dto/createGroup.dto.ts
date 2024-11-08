import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

class CreateGroupDto{

    @IsString()
    @IsNotEmpty()
    groupName:string

    @IsArray()
    @IsOptional()
    groupList:Array<String>
}

export default CreateGroupDto