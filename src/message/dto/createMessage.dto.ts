import { ApiProperty } from "@nestjs/swagger";
import {IsString, Length } from "class-validator";

export class CreateMessageDto {

  @ApiProperty({ example: "Hi!", description: "Message text" })
  @IsString({ message: "Must be a string" })
  @Length(1, 1000, { message: "Message length must be 1-1000 characters" })
  text: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Dialog's Id" })
  @IsString({ message: "Must be a string" })
  dialogId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "User's Id" })
  @IsString({ message: "Must be a string" })
  userId: string;

}