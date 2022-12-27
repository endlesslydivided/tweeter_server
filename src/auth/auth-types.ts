import { CreateUserDTO } from "../user/dto/createUser.dto";

export type Session =
{
    id:string;
    refreshToken:string;
    userAgent:string;
    fingerprint:string;
    ip:string;
    userId:string;
    createdAt:number;
}

export type TemporaryUser = CreateUserDTO

export type CreateSession = Session

export type CreateTemporaryUser = TemporaryUser

