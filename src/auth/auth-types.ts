
export type Session =
{
    refreshToken:string;
    ua:string;
    fingerprint:string;
    ip:string;
    expiresIn:number;
    createdAt:string;
}


export type TemporaryUser =
{
    firstname:string;
    surname:string;
    sex:string;
    country:string;
    city:string;
    email:string;
    password:string;
}

export type EmailToken =
{
    emailToken:string;
}

export type CreateSession =
{
    userId:string;
} & Session

export type CreateTemporaryUser = TemporaryUser

export type CreateEmailToken =
{
    email:string;
} & EmailToken