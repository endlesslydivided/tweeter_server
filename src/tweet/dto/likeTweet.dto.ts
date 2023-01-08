import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class LikeTweetDTO {

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "User which liked a tweet" })
  @IsString({ message: "Must be a string" })
  @IsNotEmpty({ message: "User ID isn't presented" })
  userId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "Liked tweet id" })
  @IsString({ message: "Must be a string" })
  @IsNotEmpty({ message: "Tweet ID isn't presented" })
  tweetId: string;
}


