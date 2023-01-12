import { ApiProperty } from "@nestjs/swagger";
import {IsString, Length } from "class-validator";

export class CreateMessageDto {

  @ApiProperty({ example: "Hi!", description: "Message text" })
  @IsString({ message: "Must be a string" })
  @Length(1, 1000, { message: "Message length must be 1-1000 characters" })
  text: string;

  @ApiProperty({ example: "0", description: "Dialog's Id" })
  @IsString({ message: "Must be a string" })
  dialogId: string;

  @ApiProperty({ example: "0", description: "User's Id" })
  @IsString({ message: "Must be a string" })
  userId: string;

}