import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Session } from "inspector";
import { Redis } from "ioredis";
import { IORedisKey } from "src/redis";
import { CreateEmailToken, CreateSession, CreateTemporaryUser, EmailToken, TemporaryUser } from "./auth-types";


@Injectable()
export class AuthRepository
{

    private readonly logger = new Logger(AuthRepository.name);
    private readonly sessionKey = `session:`;
    private readonly tempUserKey = `tempUser:`;
    private readonly emailtTokenKey = `emailToken:`;

    constructor(@Inject(IORedisKey) private readonly redisClient: Redis)
    {}

    async createSession(refreshSession:CreateSession)
    {
        try 
        {
            const key = `${this.sessionKey}${refreshSession.userId}`
            const sessionPath = `.${refreshSession.fingerprint}`;
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

    async createTemporaryUser(temporaryUser:CreateTemporaryUser)
    {
        try 
        {
            const key = `${this.tempUserKey}${temporaryUser.email}`
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

    async createEmailToken(emailTokenRecord:CreateEmailToken)
    {
        try 
        {
            const key = `${this.emailtTokenKey}${emailTokenRecord.email}`
            await this.redisClient.call('JSON.SET', key, '.', JSON.stringify(emailTokenRecord), 'NX');
            return emailTokenRecord;
        } 
        catch (e) 
        {
            this.logger.error(
                `Failed to add email token info ${JSON.stringify(emailTokenRecord)}\n${e}`,
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
            this.logger.error(`Failed to get session ${userId}`);
            throw new InternalServerErrorException(`Failed to get session ${userId}`);
        }
    }

    async getEmailToken(email: string): Promise<EmailToken> {
        this.logger.log(`Attempting to get email token with: ${email}`);
    
        const key = `${this.emailtTokenKey}${email}`;
    
        try 
        {
            const emailToken = await this.redisClient.call('JSON.GET',key,'.');    
            if (!emailToken) 
            {
                throw new BadRequestException('Email token not found');
            }
            this.logger.verbose(emailToken);
            return JSON.parse(emailToken as string);
        } 
        catch (e) 
        {
            this.logger.error(`Failed to get email token ${email}`);
            throw new InternalServerErrorException(`Failed to get email token ${email}`);
        }
    }

    async getTemporaryUser(email: string): Promise<TemporaryUser> {
        this.logger.log(`Attempting to get temporary user with: ${email}`);
    
        const key = `${this.tempUserKey}${email}`;
    
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
            this.logger.error(`Failed to get temporary user ${email}`);
            throw new InternalServerErrorException(`Failed to get temporary user ${email}`);
        }
    }
    
    async deleteSession(userId: string, fingerprint:string): Promise<void> {
        const key = `${this.sessionKey}${userId}`
        const sessionPath = `.${fingerprint}`;
    
        this.logger.log(`Deleting session: ${userId}.${fingerprint}`);
    
        try 
        {
          await this.redisClient.call('JSON.DEL', key,sessionPath);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete session: ${userId}.${fingerprint}`, e);
          throw new InternalServerErrorException(
            `Failed to delete session: ${userId}.${fingerprint}`,
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

    async deleteTemporaryUser(email: String): Promise<void> {
        const key = `${this.tempUserKey}${email}`
    
        this.logger.log(`Deleting temporary user info: ${email}`);
    
        try 
        {
          await this.redisClient.call('JSON.DEL', key);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete temporary user info: ${email}`, e);
          throw new InternalServerErrorException(
            `Failed to delete temporary user info: ${email}`,
          );
        }
    }

    async deleteEmailToken(email: String): Promise<void> {
        const key = `${this.emailtTokenKey}${email}`
    
        this.logger.log(`Deleting email token: ${email}`);
    
        try 
        {
          await this.redisClient.call('JSON.DEL', key);
        } 
        catch (e) 
        {
          this.logger.error(`Failed to delete email token: ${email}`, e);
          throw new InternalServerErrorException(
            `Failed to delete email token: ${email}`,
          );
        }
    }

    

}