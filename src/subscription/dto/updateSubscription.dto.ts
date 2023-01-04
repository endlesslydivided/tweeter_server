import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class UpdateSubscriptionDTO 
{
    @ApiProperty({ example: "false", description: "Did a user reject a request?" })
    @IsBoolean({message: "IsRejected value must be a vlue"})
    @IsNotEmpty({ message: "IsRejected isn't presented" })
    isRejected: boolean;
}