import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class UpdateDialogDto {
  
  @ApiProperty({ example: "Friends)", description: "Dialog name" })
  @IsString({ message: "Must be a string" })
  @Length(1, 50, { message: "Dialog name must be 1-50 characters length" })
  readonly name: string;
}