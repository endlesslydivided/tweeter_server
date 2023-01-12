import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, Length } from "class-validator";

export class UpdateMessageDto {

  @ApiProperty({ example: "Hi!", description: "Message text" })
  @IsString({ message: "Must be a string" })
  @Length(1, 1000, { message: "Message length must be 1-1000 characters" })
  text: string;
}