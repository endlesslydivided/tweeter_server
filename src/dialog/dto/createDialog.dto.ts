import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsString, Length } from "class-validator";

export class CreateDialogDto {

  @ApiProperty({ example: "Friends)", description: "Dialog name" })
  @IsString({ message: "Must be a string" })
  @Length(1, 50, { message: "Dialog name must be 1-50 characters length" })
  readonly name: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Id of a user, who created a dialog" })
  @IsString({ message: "Must be a string" })
  readonly creatorUserId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Id of a user, a dialog was created with" })
  @IsString({ message: "Must be a string" })
  readonly companionUserId: string;
}