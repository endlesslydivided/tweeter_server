import { BadRequestException, ForbiddenException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthDTO } from "./dto/Auth.dto";
import * as bcrypt from 'bcrypt';
import { MailService } from "../mail/mail.service";
import { InjectModel } from "@nestjs/sequelize";
import { UserService } from "../user/user.service";
import { CreateUserDTO } from "../user/dto/createUser.dto";
import { AuthRepository } from "./auth.repository";
import { User } from "src/user/user.model";
import { Transaction } from "sequelize";
import { RefreshTokensDTO } from "./dto/refreshTokens.dto";
import { PrivacyInfoArgs } from "./decorators/privacyInfoArgs.decorator";
import { CurrentUserArgs } from "./decorators/currentUserArgs.decorator";
import { InvalidRefreshTokenException } from "src/exception/invalidRefreshToken.exception";
import * as crypto from "crypto"

@Injectable()
export class AuthService {

    constructor(@Inject(forwardRef(() => UserService)) private userService: UserService,
                @Inject(forwardRef(() => JwtService)) private jwtService: JwtService,
                @Inject(forwardRef(() => MailService)) private mailService: MailService,
                private authRepository:AuthRepository
                ) {
    }

    async signIn(privacyInfoArgs:PrivacyInfoArgs,authDto: AuthDTO): Promise<{accessToken:string,refreshToken:string}>
    {
        const user = await this.validateUser(authDto);

        const {fingerprint} = authDto;
        const {ip,userAgent} = privacyInfoArgs;

        const sessionId = crypto.randomUUID();

        const {accessToken,refreshToken} = await this.getTokens(user);

        const allSessions = await this.authRepository.getAllUserSessions(user.id);
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
            await this.authRepository.deleteSession(oldSessionId,user.id);
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

    async signOut(sessionId:string) : Promise<void>
    {
        const session = await this.authRepository.getOneSession(sessionId);
        await this.authRepository.deleteSession(sessionId,session.userId);
    }

    async deleteAllSessions(currentUser: CurrentUserArgs) : Promise<void>
    {
        const {userId} = currentUser;
        await this.authRepository.deleteAllSessions(userId);
    }

    async getAllSessions(currentUser: CurrentUserArgs) : Promise<string[]>
    {
        const {userId} = currentUser;
        return this.authRepository.getAllUserSessions(userId);
    }

    async confirmEmail(emailToken: string) : Promise<User>
    {       
        const tempUser = await this.authRepository.getTemporaryUser(emailToken);
       
        if(!tempUser)
        {
            throw new BadRequestException("Invalid token or email is already confirmed");
        }

        const user = await this.userService.createUser(tempUser);
        await this.authRepository.deleteTemporaryUser(emailToken);
        return user;
        
    }

    async signUp(userDto: CreateUserDTO) : Promise<void>
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

    async refreshTokens(sessionId: string,fingerprint:string) 
    {
        const session = await this.authRepository.getOneSession(sessionId);
        await this.authRepository.deleteSession(sessionId,session.userId);

        if (!session) 
        {
            throw new NotFoundException("Refresh session is not found");
        }

        if(session.fingerprint !== fingerprint)
        {
            await this.authRepository.deleteAllSessions(session.userId);
            throw new InvalidRefreshTokenException("Fingreprints are not equal");
        }

        const decoded = await this.jwtService.verifyAsync(session.refreshToken,{algorithms:['RS256'] ,publicKey: process.env.REFRESH_TOKEN_PUBLIC});
        
        if(!decoded)
        {
            await this.authRepository.deleteAllSessions(session.userId);
            throw new InvalidRefreshTokenException("User has no access. Refresh token is expired or invalid. Log in again");       
        }

        const user = await this.userService.getUserByEmail(decoded.email);

        const newSessionId = crypto.randomUUID();
        const {accessToken,refreshToken} = await this.getTokens(user);
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
                userId: user.id,
                email: user.email       
            },
            {
                algorithm:'RS256',
                privateKey:process.env.ACCESS_TOKEN_PRIVATE,
                expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
            },
        ),
        this.jwtService.signAsync(
            {
                userId: user.id,
                email: user.email
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

  
    async validateUser(authDto: AuthDTO) : Promise<User>
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
