import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"
import { IsEmail } from "sequelize-typescript"

export class AuthDTO
{
    @ApiProperty({ example: "something@mail.com", description: "User email" })
    @IsString({message: "Email must be a string"})
    @IsNotEmpty({ message: "Email isn't presented" })
    email: string;

    @ApiProperty({ example: "123456789", description: "User password" })
    @IsString({message: "Password must be a string"})
    @IsNotEmpty({ message: "Password isn't presented" })
    password: string;

    @ApiProperty({ example: "123456678", description: "Browser fingerprint" })
    @IsString({message: "Fingerprint must be a string"})
    @IsNotEmpty({ message: "Fingerprint isn't presented" })
    fingerprint: string;
}

