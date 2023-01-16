import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { IORedisKey } from "src/redis";
import { CreateSession, CreateTemporaryUser, Session, TemporaryUser } from "./dto/auth-types";


@Injectable()
export class AuthRepository
{

    private readonly logger = new Logger(AuthRepository.name);
    private readonly userSessionsKey = `userSessions:`;
    private readonly tempUserKey = `tempUser:`;

    constructor(@Inject(IORedisKey) private readonly redisClient)
    {}

    async createSession(refreshSession:CreateSession)
    {
        try 
        {
            const userSessionsKey = `${this.userSessionsKey}${refreshSession.userId}:${refreshSession.id}`;
            await this.redisClient.set(userSessionsKey, JSON.stringify(refreshSession), `PX`,process.env.REFRESH_TOKEN_EXPIRE);
            
            return refreshSession;
        } 
        catch (e) 
        {
            this.logger.error(
                `Failed to add refresh session ${JSON.stringify(refreshSession)}\n${e}`,
            );
            throw new InternalServerErrorException();   
        }
    }

    async createTemporaryUser(emailToken:string, temporaryUser:CreateTemporaryUser)
    {
        try 
        {
            const tempUserKey = `${this.tempUserKey}${emailToken}`
            await this.redisClient.set(tempUserKey, JSON.stringify(temporaryUser), 'NX');
            return temporaryUser;
        } 
        catch (e) 
        {
            this.logger.error(
                `Failed to add user info ${JSON.stringify(temporaryUser)}\n${e}`,
            );
            throw new InternalServerErrorException();   
        }
    }

    async getAllUserSessions(userId: string): Promise<Session[] | undefined[]> {
        this.logger.log(`Attempting to get session with: ${userId}`);

        const keyRegExp = `${userId}`;

        try 
        {
            const sessionsIDs = await this.redisClient.keys(`*${keyRegExp}*`);    

            this.logger.verbose(sessionsIDs);

            if(sessionsIDs.length > 0)
            {
                const sessions = await this.redisClient.mget(sessionsIDs);
                this.logger.verbose(sessions);
                return sessions.map(x => JSON.parse(x));
            }

            return [];
        } 
        catch (e) 
        {
            this.logger.error(`Failed to get sessions ${userId}`);
            throw new InternalServerErrorException(`Failed to get sessions ${userId}`);
        }
    }

    async getOneSession(sessionId:string): Promise<Session> {
        this.logger.log(`Attempting to get session with: ${sessionId}`);
    
        const keyRegExp = `${sessionId}`;

        try 
        {
            const sessionKeys = await this.redisClient.keys(`*${keyRegExp}*`);    
            const session = await this.redisClient.get(sessionKeys);    

            this.logger.verbose(session);
            return JSON.parse(session as string);
        } 
        catch (e) 
        {
            this.logger.error(`Failed to get session ${sessionId}`);
            throw new InternalServerErrorException(`Failed to get session ${sessionId}`);
        }
    }

    async getTemporaryUser(emailToken: string): Promise<TemporaryUser> {
        this.logger.log(`Attempting to get temporary user with: ${emailToken}`);
    
        const tempUserKey = `${this.tempUserKey}${emailToken}`;
    
        try 
        {
            const userInfo =await this.redisClient.get(tempUserKey);    
            this.logger.verbose(userInfo);
            return JSON.parse(userInfo as string);
        } 
        catch (e) 
        {
            this.logger.error(`Failed to get temporary user ${emailToken}`);
            throw new InternalServerErrorException(`Failed to get temporary user ${emailToken}`);
        }
    }
    
    async deleteSession(sessionId:string,userId:string): Promise<void> {
        
        const userSessionsKey = `${this.userSessionsKey}${userId}:${sessionId}`;


        this.logger.log(`Deleting session: .${userSessionsKey}`);
    
        try 
        {
          await this.redisClient.del(userSessionsKey);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete session: ${sessionId}`, e);
          throw new InternalServerErrorException(
            `Failed to delete session: ${sessionId}`,
          );
        }
    }

    async deleteAllSessions(userId: String): Promise<void> {
        
        const userSessionsKey = `${userId}`
        this.logger.log(`Deleting sessions: ${userId}`);
    
        try 
        {
            const sessionsIDs = await this.redisClient.keys(`*${userSessionsKey}*`);    
            await this.redisClient.del(sessionsIDs);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete session: ${userId}`, e);
          throw new InternalServerErrorException(`Failed to delete session: ${userId}`);
        }
    }

    async deleteTemporaryUser(emailToken: string): Promise<void> {
        const tempUserKey = `${this.tempUserKey}${emailToken}`
    
        this.logger.log(`Deleting temporary user info: ${emailToken}`);
    
        try 
        {
          await this.redisClient.del(tempUserKey);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete temporary user info: ${emailToken}`, e);
          throw new InternalServerErrorException(`Failed to delete temporary user info: ${emailToken}`);
        }
    }
    

}