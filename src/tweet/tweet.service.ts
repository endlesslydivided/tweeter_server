import {  forwardRef, Inject, Injectable, InternalServerErrorException,Logger,NotFoundException} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { QueryTypes, where } from 'sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';
import { Media } from 'src/media/media.model';
import DBQueryParameters from 'src/requestFeatures/dbquery.params';
import { User } from 'src/user/user.model';
import { MediaService } from '../media/media.service';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { LikedTweet } from './likedTweet.model';
import { SavedTweet } from './savedTweet.model';
import { Tweet } from './tweet.model';
import { TweetCounts } from './tweetcounts.model';

const countIncludes = [
    {model: TweetCounts,
        attributes:['tweetId','likesCount','savesCount','retweetsCount','commentsCount'],}
]

const commentExtraIncludes = (id) => [
    {model: Media,as:'tweetMedia', required:false},
    {model: Tweet,required:false,as:'parentRecord', where:{id},include:
    [
        {model: User,as:'author',include: [{model:Media,as:"mainPhoto"}],attributes:["id","firstname","surname","country","city"]},

    ]},
    {model: User,as:'author',include: [{model:Media,as:"mainPhoto"}],attributes:["id","firstname","surname","country","city"]}
]

const tweetExtraIncludes = [
    {model: Media,as:'tweetMedia', required:false},
    {model: Tweet,required:false,as:'parentRecord',include:
    [
        {model: Media,as:'tweetMedia', required:false},
        {model: TweetCounts,on:{"tweetId": {[Op.eq]: Sequelize.col('parentRecord.id')}}},
        {model: User,as:'author',include: [{model:Media,as:"mainPhoto"}],attributes:["id","firstname","surname","country","city"]},
    ]},
    {model: User,as:'author',include: [{model:Media,as:"mainPhoto"}],attributes:["id","firstname","surname","country","city"]}
]

const userActionIncludes = (currentUserId) => [
    {model: SavedTweet,as: 'isSaved',attributes:['tweetId'],required:false,where:{userId:currentUserId}},
    {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false,where:{userId:currentUserId}},
    {
        model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
        where:{[Op.and]:{isComment:false,isPublic:true,authorId:currentUserId}}
    }
]

@Injectable()
export class TweetService {

    private logger: Logger = new Logger('TweetService');

    constructor(@InjectModel(Tweet) private tweetRepository: typeof Tweet,
                @Inject(forwardRef(() => MediaService)) private mediaService: MediaService){}

    async createTweet(files: Array<Express.Multer.File>,dto: CreateTweetDTO,transaction:Transaction) 
    {  
        if(dto.isComment && !dto.parentRecordAuthorId && !dto.parentRecordId)   
        {
            this.logger.error(`Tweet is not created. Comment tweet must contain parent record ID and its author ID.`);
            throw new BadRequestException('Tweet is not created. Comment tweet must contain parent record ID and its author ID.')
        }

        if(dto.parentRecordId)
        {
            const parentTweet = await this.tweetRepository.findByPk(dto.parentRecordId,{include:[...tweetExtraIncludes]});

            if(parentTweet.parentRecordAuthorId !== null && parentTweet.parentRecord === null)
            {
                this.logger.error(`Tweet is not created. Retweet of deleted tweet is now allowed`);
                throw new BadRequestException('Tweet is not created. Retweet of deleted tweet is now allowed')
    
            }
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

    async getTweetById(id: string,currentUserId:string) 
    {       
        const tweet = await this.tweetRepository.findByPk(id,{
            include:
            [
                ...tweetExtraIncludes,
                ...countIncludes,
                ...userActionIncludes(currentUserId)
            ]
        });
        
        if(!tweet)
        {
            this.logger.error(`Tweet is not found:${id}`);
            throw new NotFoundException(`Tweet is not found.`)
        }
        return tweet;
    }

    async getComments(id: string,filters : DBQueryParameters,currentUserId:string)
    {   
        const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('Tweet.isComment'), { [Op.eq]: true } ),
                sequelize.where(sequelize.col('Tweet.parentRecordId'), { [Op.eq]: id } ),             
            ]
        }

        if(filters.createdAt)
        {
            where[Op.and].push(sequelize.where(sequelize.col('Tweet.createdAt'), { [Op.lt]:filters.createdAt} ));
        }

        const result = await this.tweetRepository.findAndCountAll(
        {
            where,
            paranoid:true,
            limit:filters.limit,
            order:filters.order,
            include:
            [
                ...countIncludes,    
                ...commentExtraIncludes(id),
                ...userActionIncludes(currentUserId)
            ]
        }).catch((error) => {
          this.logger.error(`Comments aren't found: ${error.message}`);
          throw new InternalServerErrorException("Comments aren't found. Internal server error.");
        });
  
        return result;
    }

    async getReplies(id: string,filters : DBQueryParameters,currentUserId:string)
    {
      const count = await this.tweetRepository.count({where:{parentRecordId:id,isComment:true}});
      
      const tweetIds = await this.tweetRepository.sequelize.query(`select get_comment_replies_ids(:parentRecordId) "id"`,
        {
          replacements: {parentRecordId:id},
          type: QueryTypes.SELECT,
        }
      )
      .then(result =>result.map((x:{id:string}) => x.id))
      .catch((error) => {
        this.logger.error(`Comment replies are not found: ${error.message}`);
        throw new InternalServerErrorException("Comment replies are not found. Internal server error.");
      });

      const rows = await this.tweetRepository.findAll({
          where: {id:{[Op.in]:tweetIds}},
          paranoid:true,
          order:filters.order,
          include:
          [
            ...tweetExtraIncludes,
            ...countIncludes,
            ...userActionIncludes(currentUserId)
          ]
      }).catch((error) => {
        this.logger.error(`User saved tweets are not found: ${error.message}`);
        throw new InternalServerErrorException("User saved tweets are not found. Internal server error.");
      });

      return {count,rows};
    }

    async getTopTweets(filters : DBQueryParameters,currentUserId:string)
    {   
        const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('Tweet.isComment'), { [Op.eq]: false } ), 
                sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.eq]:true})                           
            ]
        }

        if(filters.createdAt)
        {
            where[Op.and].push(sequelize.where(sequelize.col('Tweet.createdAt'), { [Op.lt]:filters.createdAt} ));
        }

        const result = await this.tweetRepository.findAndCountAll(
        {
            where,
            subQuery:false,
            paranoid:true,
            limit:filters.limit,
            order:[[Sequelize.col('counts.likesCount'),'DESC'],...filters.order],
            include:
            [
                ...tweetExtraIncludes,
                ...countIncludes,    
                ...userActionIncludes(currentUserId)
            ]
        }).catch((error) => {
          this.logger.error(`Top tweets aren't found: ${error.message}`);
          throw new InternalServerErrorException("Top tweets aren't found. Internal server error.");
        });
  
        return result;
    }

    async getMediaTweets(filters : DBQueryParameters,currentUserId:string)
    {
        const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('Tweet.isComment'), { [Op.eq]: false } ),     
                sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.eq]:true})                
            ]
        }

        if(filters.createdAt)
        {
            where[Op.and].push(sequelize.where(sequelize.col('Tweet.createdAt'), { [Op.lt]:filters.createdAt} ));
        }

      const result = await this.tweetRepository.findAndCountAll({
        where,
        subQuery:false,
        paranoid:true,
        limit:filters.limit,
        order:filters.order,
        distinct:true,
        include:
        [
          ...countIncludes,
          ...userActionIncludes(currentUserId),
          {model: Media,as:'tweetMedia', required:true},
          {model: Tweet,required:false,as:'parentRecord',include:
          [
            {model: Media,as:'tweetMedia', required:true},        
            {model: TweetCounts,on:{"tweetId": {[Op.eq]: Sequelize.col('parentRecord.id')}}},

            {model: User,as:'author',include: [{model:Media,as:"mainPhoto"}],attributes:["id","firstname","surname","country","city"]},

          ]},
          {model: User,as:'author',include: [{model:Media,as:"mainPhoto"}],attributes:["id","firstname","surname","country","city"]}
        ]          
      })     
      .catch(error =>
      {
        console.log(error);         
      })

      return result;
    }

    async getTweets(filters : DBQueryParameters,currentUserId:string)
    {   
        const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('Tweet.isComment'), { [Op.eq]: false } ),      
                sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.eq]:true})                      
            ]
        }

        if(filters.createdAt)
        {
            where[Op.and].push(sequelize.where(sequelize.col('Tweet.createdAt'), { [Op.lt]:filters.createdAt} ));
        }

        const result = await this.tweetRepository.findAndCountAll(
        {
            where,
            paranoid:true,
            limit:filters.limit,
            order:[...filters.order],
            include:
            [
                ...tweetExtraIncludes,
                ...countIncludes,    
                ...userActionIncludes(currentUserId)
            ]
        }).catch((error) => {
          this.logger.error(`Tweets aren't found: ${error.message}`);
          throw new InternalServerErrorException("Tweets aren't found. Internal server error.");
        });
  
        return result;
    }


    async deleteTweetById(id: string) 
    {
        const tweet = await this.tweetRepository.findByPk(id);
        await this.tweetRepository.destroy({where:{id},});
        return tweet;
    }
 
    async restoreTweetById(id: string) 
    {
        return await this.tweetRepository.restore({where:{id}});
    }
 
   

}
