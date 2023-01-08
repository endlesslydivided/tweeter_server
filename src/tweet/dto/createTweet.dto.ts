import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateTweetDTO {

  @ApiProperty({ example: "My first post content", description: "Tweet text" })
  @IsString({ message: "Must be a string" })
  @Length(0, 1000, { message: "Text length: from 0 to 1000 symbols" })
  @IsOptional()
  text: string;

  @ApiProperty({ example: "false", description: "Is tweet a comment?" })
  @IsBoolean({ message: "Must be a boolean value" })
  @IsNotEmpty({ message: "IsComment value not presenterd" })
  isComment: boolean;

  @ApiProperty({ example: "false", description: "Is tweet public?" })
  @IsBoolean({ message: "Must be a boolean value" })
  @IsNotEmpty({ message: "IsPublic isn't presented" })
  isPublic: boolean;

  @ApiProperty({ example: "0", description: "ID of tweet author" })
  @IsString({ message: "Author ID must be a string" })
  @IsNotEmpty({ message: "Author ID isn't presented" })
  authorId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "ID of tweet parent record author" })
  @IsOptional()
  parentRecordAuthorId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174002", description: "ID of tweet parent record" })
  @IsOptional()
  parentRecordId: string;

}


