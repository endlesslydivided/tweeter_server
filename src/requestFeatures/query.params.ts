import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, min } from "class-validator";
import { OrderItem } from "sequelize";
export default class QueryParameters
{
    @Transform(({ value }) => parseInt(value))
    @IsNumber({},{message:"Limit param must be a number"})
    @Min(1,{message:"Limit param must be greater than 1"}) @Max(100,{message:"Limit param must be less than 100"})
    @IsOptional()
    public limit:number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber({},{message:"Page param must be a number"})
    @Min(1,{message:"Page param must be greater than 1"}) 
    @IsOptional()
    public page:number;

    @IsString({message:"Order by value must be a string"})
    @IsOptional()
    public orderBy:string;

    @IsString({message:"Order direction value must be a string"})
    @IsIn(['desc','asc'],{message:"Order direction value can only be 'asc' or 'desc'"})
    @IsOptional()
    public orderDirection:string;
}