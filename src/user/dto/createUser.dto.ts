import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "Alexander", description: "User's firstname" })
  @IsString({ message: "Должно быть строкой" })
  @Length(1, 50, { message: "Длина имени: до 50 символов" })
  firstname: string;

  @ApiProperty({ example: "Kovalyov", description: "User's lastname" })
  @IsString({ message: "Должно быть строкой" })
  @Length(1, 50, { message: "Длина фамилии: до 50 символов" })
  surname: string;

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

  @ApiProperty({ example: "user@do.men", description: "User's email" })
  @IsString({ message: "Должно быть строкой" })
  @IsEmail({}, { message: "Некорректный email" })
  email: string;

  @ApiProperty({ example: "12345", description: "User's password" })
  @IsString({ message: "Должно быть строкой" })
  @Length(8, 30, { message: "Длина пароля: от 8 до 30 символов" })
  password: string;

  @ApiProperty({ example: "12345", description: "User's password hash salt" })
  salt: string;
}


