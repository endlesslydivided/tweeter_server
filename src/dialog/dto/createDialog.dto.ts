import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateDialogDto {

  @ApiProperty({ example: "Friends)", description: "Dialog name" })
  @IsOptional()
  readonly name: string;

  @ApiProperty({ example: "false", description: "Is a group dialog" })
  readonly isGroup: boolean;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Id of a user, who created a dialog" })
  @IsString({ message: "Must be a string" })
  readonly creatorId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Id of a user, a dialog was created with" })
  @IsString({ message: "Must be a string" })
  readonly companionId: string;
}