import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import { IORedisKey } from "src/redis";
import { CreateSession, CreateTemporaryUser, Session, TemporaryUser } from "./auth-types";


@Injectable()
export class AuthRepository
{

    private readonly logger = new Logger(AuthRepository.name);
    private readonly sessionKey = `session:`;
    private readonly tempUserKey = `tempUser:`;

    constructor(@Inject(IORedisKey) private readonly redisClient: Redis)
    {}

    async createSession(refreshSession:CreateSession)
    {
        try 
        {
            const key = `${this.sessionKey}${refreshSession.userId}`;
            const sessionPath = `.${refreshSession.id}`;
            await this.redisClient.call('JSON.SET', key, sessionPath, JSON.stringify(refreshSession), 'NX');
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
            const key = `${this.tempUserKey}${emailToken}`
            await this.redisClient.call('JSON.SET', key, '.', JSON.stringify(temporaryUser), 'NX');
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

    async getAllSessions(userId: string): Promise<Session> {
        this.logger.log(`Attempting to get session with: ${userId}`);
    
        const key = `${this.sessionKey}${userId}`;
    
        try 
        {
            const sessions = await this.redisClient.call('JSON.GET',key,'.');    
            if (!sessions) 
            {
                throw new BadRequestException('User sessions are not found');
            }
            this.logger.verbose(sessions);
            return JSON.parse(sessions as string);
        } 
        catch (e) 
        {
            this.logger.error(`Failed to get sessions ${userId}`);
            throw new InternalServerErrorException(`Failed to get sessions ${userId}`);
        }
    }

    async getOneSession(userId: string,sessionId:string): Promise<Session> {
        this.logger.log(`Attempting to get session with: ${userId}.${sessionId}`);
    
        const key = `${this.sessionKey}${userId}`
        const sessionPath = `.${sessionId}`;
    
        try 
        {
            const session = await this.redisClient.call('JSON.GET',key,sessionPath);    
            if (!session) 
            {
                throw new BadRequestException('User session is not found');
            }

            this.logger.verbose(session);
            return JSON.parse(session as string);
        } 
        catch (e) 
        {
            this.logger.error(`Failed to get session ${userId}.${sessionId}`);
            throw new InternalServerErrorException(`Failed to get session ${userId}.${sessionId}`);
        }
    }

    async getTemporaryUser(emailToken: string): Promise<TemporaryUser> {
        this.logger.log(`Attempting to get temporary user with: ${emailToken}`);
    
        const key = `${this.tempUserKey}${emailToken}`;
    
        try 
        {
            const userInfo = await this.redisClient.call('JSON.GET',key,'.');    
            if (!userInfo) 
            {
                throw new BadRequestException('User not found');
            }
            this.logger.verbose(userInfo);
            return JSON.parse(userInfo as string);
        } 
        catch (e) 
        {
            this.logger.error(`Failed to get temporary user ${emailToken}`);
            throw new InternalServerErrorException(`Failed to get temporary user ${emailToken}`);
        }
    }
    
    async deleteSession(userId: string, sessionId:string): Promise<void> {
        const key = `${this.sessionKey}${userId}`
        const sessionPath = `.${sessionId}`;
    
        this.logger.log(`Deleting session: ${userId}.${sessionId}`);
    
        try 
        {
          await this.redisClient.call('JSON.DEL', key,sessionPath);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete session: ${userId}.${sessionId}`, e);
          throw new InternalServerErrorException(
            `Failed to delete session: ${userId}.${sessionId}`,
          );
        }
    }

    async deleteAllSessions(userId: String): Promise<void> {
        const key = `${this.sessionKey}${userId}`
    
        this.logger.log(`Deleting sessions: ${userId}`);
    
        try 
        {
          await this.redisClient.call('JSON.DEL', key);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete session: ${userId}`, e);
          throw new InternalServerErrorException(
            `Failed to delete session: ${userId}`,
          );
        }
    }

    async deleteTemporaryUser(emailToken: string): Promise<void> {
        const key = `${this.tempUserKey}${emailToken}`
    
        this.logger.log(`Deleting temporary user info: ${emailToken}`);
    
        try 
        {
          await this.redisClient.call('JSON.DEL', key);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete temporary user info: ${emailToken}`, e);
          throw new InternalServerErrorException(
            `Failed to delete temporary user info: ${emailToken}`,
          );
        }
    }
    

}