import { CreateUserDto } from "../user/dto/createUser.dto";

export type Session =
{
    id:string;
    refreshToken:string;
    userAgent:string;
    fingerprint:string;
    ip:string;
    createdAt:number;
}

export type TemporaryUser = CreateUserDto

export type CreateSession = {userId:string;} & Session

export type CreateTemporaryUser = TemporaryUser

