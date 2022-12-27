import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class UpdateUserDTO {
    @ApiProperty({ example: "Alexander", description: "User's firstname" })
    @IsString({ message: "Должно быть строкой" })
    @Length(0, 50, { message: "Длина имени: до 50 символов" })
    @IsOptional()
    firstName: string;
  
    @ApiProperty({ example: "Kovalyov", description: "User's lastname" })
    @IsString({ message: "Должно быть строкой" })
    @Length(0, 50, { message: "Длина фамилии: до 50 символов" })
    @IsOptional()
    surname: string;
  
    @ApiProperty({ example: "12345", description: "User's password" })
    @IsString({ message: "Должно быть строкой" })
    @Length(8, 30, { message: "Длина пароля: от 8 до 30 символов" })
    @IsOptional()
    password: string;

    @ApiProperty({ example: "0", description: "User's main photo ID" })
    @IsNumber({},{ message: "Должно быть числом" })
    @IsOptional()
    mainPhoto: number;
}