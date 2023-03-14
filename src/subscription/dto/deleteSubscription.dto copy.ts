import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class DeleteSubsriptionDTO {

  @ApiProperty({ example: "0", description: "ID of user subscribed" })
  @IsString({ message: "Subscriber ID must be a string" })
  @IsNotEmpty({ message: "Subscriber ID isn't presented" })
  subscriberId: string;

  @ApiProperty({ example: "1", description: "ID of user to be subscribed" })
  @IsString({ message: "Subscribed user ID must be a string" })
  @IsNotEmpty({ message: "Subscribed user ID isn't presented" })
  subscribedUserId: string;

}


