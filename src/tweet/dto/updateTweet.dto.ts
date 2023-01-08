import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateTweetDTO 
{
    @ApiProperty({ example: "My first post content", description: "Tweet text" })
    @IsString({ message: "Must be a string" })
    @Length(0, 1000, { message: "Text length: from 0 to 1000 symbols" })
    text: string;
}