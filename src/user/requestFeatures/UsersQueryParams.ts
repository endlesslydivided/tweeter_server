import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import QueryParameters from "src/requestFeatures/query.params";

export default class UsersQueryParams extends QueryParameters
{
    constructor()
    {
        super();
    }
    @IsString({message:"Sex param must be a string"})
    @IsOptional()
    public sex?:'man'|'woman'| "" = "";

    @IsString({message:"Search param must be a string"})
    @IsOptional()
    public search?:string = '';

    @Transform(({ value }) => value === 'true' || value === true ? true : false)
    @IsOptional()
    public havePhoto?:boolean = false;

    @IsString({message:"Search param must be a string"})
    @IsOptional()
    public country?:string = '';

    
}