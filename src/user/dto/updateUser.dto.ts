import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class UpdateUserDTO {
    @ApiProperty({ example: "Alexander", description: "User's firstname" })
    @IsString({ message: "Must be a string" })
    @Length(0, 50, { message: "Length of firstname: max 50 symbols" })
    @IsOptional()
    firstname: string;
  
    @ApiProperty({ example: "Kovalyov", description: "User's lastname" })
    @IsString({ message: "Must be a string" })
    @Length(0, 50, { message: "Length of surname: max 50 symbols" })
    @IsOptional()
    surname: string;

    @ApiProperty({ example: "Welcome to my page!", description: "User's profile description" })
    @IsString({ message: "Must be a string" })
    @Length(0, 255, { message: "Length of description: max 50 symbols" })
    @IsOptional()
    description: string;

    @ApiProperty({ example: "Man", description: "Sex" })
    @IsString({ message: "Должно быть строкой" })
    @Length(1, 10, { message: "Не больше 10 символов" })
    sex: string;

    @ApiProperty({ example: "Belarus", description: "User's country of living" })
    @IsString({ message: "Должно быть строкой" })
    @Length(1, 50, { message: "Не больше 50 символов" })
    country: string;

    @ApiProperty({ example: "Minsk", description: "User's city of living" })
    @IsString({ message: "Должно быть строкой" })
    @Length(1, 100, { message: "Не больше 100 символов" })
    city: string;
  
    @ApiProperty({ example: "12345", description: "User's password" })
    @IsString({ message: "Must be a string" })
    @Length(8, 30, { message: "Length of password: from 8 to 30 symbols" })
    @IsOptional()
    password: string;
}