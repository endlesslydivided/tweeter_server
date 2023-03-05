import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, min } from "class-validator";
import { OrderItem } from "sequelize";
export default class DBQueryParameters
{
    public limit?:number;

    public createdAt?:string;

    public offset?:number;

    public order?:OrderItem[];
}