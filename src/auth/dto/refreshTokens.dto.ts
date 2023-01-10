import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokensDTO
{
    @ApiProperty({ example: "123456678", description: "Browser fingerprint" })
    @IsString({message: "Fingerprint must be a string"})
    @IsNotEmpty({ message: "Fingerprint isn't presented" })
    fingerprint:string
}