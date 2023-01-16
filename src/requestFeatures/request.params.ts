import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, Max, Min, min } from "class-validator";
import { OrderItem } from "sequelize";
export default class RequestParameters
{
    @Transform(({ value }) => parseInt(value))
    @IsNumber({},{message:"Limit param must be a number from 1 to 100"})
    @Min(1) @Max(100)
    @IsNotEmpty({message:"Limit param must not be empty"})
    public limit:number = 10;

    @Transform(({ value }) => parseInt(value))
    @IsNumber({},{message:"Page param must be a number more than 1"})
    @Min(1) 
    @IsNotEmpty({message:"Page param must not be empty"})
    public page:number = 1;

    @IsOptional()
    public orderBy: Array<Array<string>>;

    @IsOptional()
    public fields:string[]; 
}