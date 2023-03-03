import {  forwardRef, Inject, Injectable, InternalServerErrorException,Logger,NotFoundException} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';
import { Media } from 'src/media/media.model';
import DBQueryParameters from 'src/requestFeatures/dbquery.params';
import { User } from 'src/user/user.model';
import { MediaService } from '../media/media.service';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { LikedTweet } from './likedTweet.model';
import { Tweet } from './tweet.model';

@Injectable()
export class TweetService {

    private logger: Logger = new Logger('TweetService');

    constructor(@InjectModel(Tweet) private tweetRepository: typeof Tweet,
                @Inject(forwardRef(() => MediaService)) private mediaService: MediaService){}

    async createTweet(files:any[],dto: CreateTweetDTO,transaction:Transaction) 
    {  
        if(dto.isComment && !dto.parentRecordAuthorId && !dto.parentRecordId)   
        {
            this.logger.error(`Tweet is not created. Comment tweet must contain parent record ID and its author ID.`);
            throw new BadRequestException('Tweet is not created. Comment tweet must contain parent record ID and its author ID.')
        }
        const tweet = await this.tweetRepository.create(dto,{transaction,returning:true})
        .catch((error) =>
        {
            this.logger.error(`Tweet is not created:${error.message}`);
            throw new InternalServerErrorException('Tweet cannot be created. Internal server error.')
        });

        if(files && files.length !== 0)
        {
            await this.mediaService.createTweetMedia(files, tweet.id,transaction)
            .catch((error) => 
            {
                this.logger.error(`Tweet is not created:${error.message}`);
                throw new InternalServerErrorException("Error occured during media creation. Internal server error.");
            });  
        }
        
        return tweet;
             
    }

    async getTweetById(id: string) 
    {
        const tweet = await this.tweetRepository.findByPk(id);
        if(!tweet)
        {
            this.logger.error(`Tweet is not found:${id}`);
            throw new NotFoundException(`Tweet is not found.`)
        }
        return tweet;
    }

    async getComments(id: string,filters : DBQueryParameters) 
    {
        const result = await this.tweetRepository.findAndCountAll({
            where:{[Op.and]:{isComment:true,parentRecordId:id}},
            ...filters,
            include:
            [
              {model: Media,as:'tweetMedia'},
              {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false},
              {
                model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
                where:{isPublic:true}
              },
              {model: Tweet,required:false,as:'parentRecord', where:{id},include:
              [
                {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]},
  
              ]},
              {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
            ]
        }).catch((error) => {
          this.logger.error(`Comment aren't found: ${error.message}`);
          throw new InternalServerErrorException("Comment aren't found. Internal server error.");
        });
  
        return result;
    }

    async deleteTweetById(id: string) 
    {
        return await this.tweetRepository.destroy({where:{id}});
    }
 
   

}
