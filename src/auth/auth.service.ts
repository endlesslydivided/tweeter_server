import { BadRequestException, ForbiddenException, forwardRef, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthDto } from "./dto/Auth.dto";
import * as bcrypt from 'bcrypt';
import { MailService } from "../mail/mail.service";
import { InjectModel } from "@nestjs/sequelize";
import { UserService } from "../user/user.service";
import { CreateUserDto } from "../user/dto/createUser.dto";
import { AuthRepository } from "./auth.repository";
import { User } from "src/user/user.model";
import { Transaction } from "sequelize";

@Injectable()
export class AuthService {

    constructor(@Inject(forwardRef(() => UserService)) private userService: UserService,
                @Inject(forwardRef(() => JwtService)) private jwtService: JwtService,
                @Inject(forwardRef(() => MailService)) private mailService: MailService,
                private authRepository:AuthRepository
                ) {
    }

    async login(authDto: AuthDto): Promise<{accessToken:string,refreshToken:string}>
    {
        const user = await this.validateUser(authDto);
        const {userAgent,ip,fingerprint} = authDto;
        const {accessToken,refreshToken} = await this.getTokens(user);
        const sessionId = crypto.randomUUID();
        const allSessions = this.authRepository.getAllSessions(user.id);
        if(Object.keys(allSessions).length >= 10)
        {
            let oldSessionDate:number = 0;
            let oldSessionId:string;
            for (const key in allSessions) {
                if (allSessions.hasOwnProperty(key)) 
                {
                    if(oldSessionDate < allSessions[key]['createdAt']) 
                    {
                        oldSessionDate = allSessions[key]['createdAt'];
                        oldSessionId= allSessions[key]['id']
                    }
                }
            }
            await this.authRepository.deleteSession(user.id,oldSessionId);
        }
        await this.authRepository.createSession(
            {   
                id: sessionId,
                userAgent,
                ip,
                fingerprint,
                userId:user.id,
                refreshToken,
                createdAt:Date.now()
            });
        return {accessToken,refreshToken:sessionId};
    }

    async logout(sessionId:string,userId: string) 
    {
        await this.authRepository.deleteSession(userId,sessionId);
    }

    async deleteAllSessions(userId: string) 
    {
        await this.authRepository.deleteAllSessions(userId);
    }

    async confirmEmail(emailToken: string,transaction:Transaction) : Promise<User>
    {       
        const tempUser = await this.authRepository.getTemporaryUser(emailToken);      
        if(!tempUser)
        {
            throw new BadRequestException("Invalid token or email is already confirmed");
        }
        const user = await this.userService.createUser(tempUser,transaction);
        await this.authRepository.deleteTemporaryUser(emailToken);
        return user;
    }

    async registration(userDto: CreateUserDto) : Promise<void>
    {
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) 
        {
            throw new BadRequestException("User with such credentials already exists");
        }
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(userDto.password, salt);       
        const emailToken = crypto.randomUUID();

        await this.authRepository.createTemporaryUser(emailToken,{...userDto,password,salt});
        await this.mailService.sendUserConfirmation(userDto,emailToken);    
    }

    async refreshTokens(sessionId:string,userId:string,fingerprint:string) 
    {
        const session = await this.authRepository.getOneSession(userId,sessionId);
        await this.authRepository.deleteSession(userId,sessionId);

        if (!session) 
        {
            throw new BadRequestException("Refresh session is not found");
        }

        if(session.fingerprint !== fingerprint)
        {
            throw new BadRequestException("Fingreprints are not equal");
        }

        const decoded:{email:string,id:string} = await this.jwtService.verifyAsync(session.refreshToken,{algorithms:['RS256'] ,publicKey: process.env.REFRESH_TOKEN_PUBLIC});
        
        if(!decoded)
        {
            throw new ForbiddenException("User has no access. Refresh token is expired or invalid. Log in again");       
        }
        const user = await this.userService.getUserByEmail(decoded.email);

        if (!user) 
        {
            throw new BadRequestException("User is not found. Register or log in again");
        }

        const {accessToken,refreshToken} = await this.getTokens(user);
        const newSessionId = crypto.randomUUID();
        await this.authRepository.createSession(
            {   
                ...session,
                id: newSessionId,
                fingerprint,
                userId:user.id,
                refreshToken,
                createdAt:Date.now()
            });
        return {accessToken,refreshToken:sessionId};

    }

    async getTokens(user): Promise<{accessToken:string,refreshToken:string}>
    {
        const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
            {
                id: user.id,
                email: user.email,
            },
            {
                algorithm:'RS256',
                privateKey:process.env.ACCESS_TOKEN_PRIVATE,
                expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
            },
        ),
        this.jwtService.signAsync(
            {
                id: user.id,
                email: user.email,
            },
            {
                algorithm:'RS256',
                privateKey: process.env.REFRESH_TOKEN_PRIVATE,
                expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
            },
        ),
        ]);
        return {accessToken,refreshToken};
    }

  
    async validateUser(authDto: AuthDto) : Promise<User>
    {
        const user = await this.userService.getUserByEmail(authDto.email);
        if(user)
        {        
            if (user.password === await bcrypt.hash(authDto.password, user.salt)) 
            {
                return user;
            }
        }
    
        throw new UnauthorizedException("Invalid email or password");
    }
}
