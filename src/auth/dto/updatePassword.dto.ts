import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePasswordDTO
{
    @ApiProperty({ example: "123456789", description: "User old password" })
    @IsString({message: "Old password must be a string"})
    @IsNotEmpty({ message: "Old password isn't presented" })
    oldPassword:string

    @ApiProperty({ example: "123456789", description: "User new password" })
    @IsString({message: "New password must be a string"})
    @IsNotEmpty({ message: "New password isn't presented" })
    newPassword:string
}