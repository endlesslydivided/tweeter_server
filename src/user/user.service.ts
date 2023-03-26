import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import { filter } from 'rxjs';
import sequelize from 'sequelize';
import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import { FavoriteMessage } from 'src/message/favoriteMessage.model';
import { TweetCounts } from 'src/tweet/tweetcounts.model';
import { Dialog } from '../dialog/dialog.model';
import { UserDialog } from '../dialog/userDialog.model';
import { Media } from '../media/media.model';
import { MediaService } from '../media/media.service';
import { Message } from '../message/message.model';
import DBQueryParameters from '../requestFeatures/dbquery.params';
import QueryParameters from '../requestFeatures/query.params';
import { Subscription } from '../subscription/subscription.model';
import { LikedTweet } from '../tweet/likedTweet.model';
import { SavedTweet } from '../tweet/savedTweet.model';
import { Tweet } from '../tweet/tweet.model';
import { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';
import UsersQueryParams from './requestFeatures/UsersQueryParams';
import { User } from './user.model';
import { UserCounts } from './userCounts.model';

const countIncludes =[
  {model: TweetCounts}
]


const userActionIncludes = (currentUserId) => [
  {model: SavedTweet,as: 'isSaved',attributes:['tweetId'],required:false,where:{userId:currentUserId}},
  {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false,where:{userId:currentUserId}},
  {
    model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
    where:{[Op.and]:{isComment:false,isPublic:true,authorId:currentUserId}}
  },
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

@Injectable()
export class UserService {

    private logger: Logger = new Logger('UserService');

    constructor(@InjectModel(User) private userRepository: typeof User,
                @InjectModel(Subscription) private subsRepository: typeof Subscription,
                @InjectModel(Tweet) private tweetRepository: typeof Tweet,
                @InjectModel(Dialog) private dialogRepository: typeof Dialog,
                @InjectModel(Media) private mediaRepository: typeof Media,
                @InjectModel(LikedTweet) private likedTweetRepository: typeof LikedTweet,
                @InjectModel(FavoriteMessage) private favoriteMessageRepository: typeof FavoriteMessage,
                @InjectModel(SavedTweet) private savedTweetRepository: typeof SavedTweet,
                @Inject(forwardRef(() => MediaService)) private mediaService: MediaService)
    {}

    async createUser(dto: CreateUserDTO) 
    {
        return await this.userRepository.create(dto);
    }

    async getUserByEmail(email: string) 
    {
        return await this.userRepository.findOne({ where: { email }});
    }

    async getUserDataById(id:string)
    {
      const user = await  this.userRepository.findByPk(id, {include: 
        [
          {model:UserCounts},
          {model:Media,as:"mainPhoto",required:false},
          {model:Media,as:"profilePhoto",required:false}
        ],
        attributes:['id','firstname','surname','description','email','city','country','sex']
      }).catch(e => console.log(e));

      if(!user)
      {
        this.logger.error(`User is not found: ${id}`);
        throw new NotFoundException(`User is not found.`);
      }

      return user;
    }

    async getUserById(id: string,currentUserId:string) 
    {
        const user = await  this.userRepository.findByPk(id, {include: 
          [
            {model:UserCounts},
            {model:Media,as:"mainPhoto",required:false},
            {model:Media,as:"profilePhoto",required:false},
            {model:Subscription,as:"isSubscribed",required:false, 
              on:{[Op.and]:{subscriberId:currentUserId,subscribedUserId:id}}},
            {model:Subscription,as:"isFollower",required:false,
            on:{[Op.and]:{subscriberId:id,subscribedUserId:currentUserId}}},
          ],
          attributes:['id','firstname','surname','description','email','city','country','sex']
        }).catch(e => console.log(e));

        if(!user)
        {
          this.logger.error(`User is not found: ${id}`);
          throw new NotFoundException(`User is not found.`);
        }

        return user;
    }

    async getMe(id: string) 
    {
        const user = await  this.userRepository.findByPk(id, {include: 
          [
            {model:UserCounts},
            {model:Media,as:"mainPhoto"},
            {model:Media,as:"profilePhoto"}
          ],
          attributes:['id','firstname','surname','description','email','city','country','sex','description']
        }).catch(e => console.log(e));

        if(!user)
        {
          this.logger.error(`User is not found: ${id}`);
          throw new NotFoundException(`User is not found.`);
        }

        return user;
    }

    async getUsers(filters: UsersQueryParams,currentUserId:string) 
    {    
      const searchTerms = filters.search.toLowerCase().trim().split(' ');
      const where = 
      {
        [Op.and]: 
        [
          sequelize.where(sequelize.col('User.id'), { [Op.ne]:currentUserId} ),

          sequelize.where(sequelize.col('country'), { [Op.like]: `%${filters.country}%` } ),
          filters.sex && sequelize.where(sequelize.col('sex'), { [Op.eq]: filters.sex} ),
          sequelize.where(
            sequelize.fn('CONCAT',
            sequelize.fn('LOWER', sequelize.col('firstname')),
            sequelize.fn('LOWER', sequelize.col('surname')))
            , {[Op.like]: `%${filters.search.toLowerCase().replace(' ','').trim()}%`})
        ],
        [Op.or]: 
        [
          ...searchTerms.map(x =>sequelize.where(sequelize.fn('LOWER', sequelize.col('surname')), {[Op.like]: `%${x}%`})),
          ...searchTerms.map(x =>sequelize.where(sequelize.fn('LOWER', sequelize.col('firstname')), {[Op.like]: `%${x}%`})),          
        ]
      }
      const users = await this.userRepository.findAndCountAll({
          ...filters, 
          where,
          include: 
            [
              {model:UserCounts},
              {model:Media,as:"mainPhoto", required:!!filters.havePhoto},
              {model:Subscription,as:"isSubscribed",required:false, 
                on:{[Op.and]:{subscriberId:currentUserId}}},
              {model:Subscription,as:"isFollower",required:false,
              on:{[Op.and]:{subscribedUserId:currentUserId}}},
            ],
          distinct:true,
          attributes:{exclude:['password','salt','accessFailedCount','emailConfirmed']}
      }).catch((e:any) => console.log(e));
      return users;
    }

    async updateUserById(id:string, dto: UpdateUserDTO,transaction:Transaction) 
    {
        const user = await this.userRepository.findByPk(id);

        if(!user)
        {
          this.logger.error(`User is not found: ${id}`);
          throw new NotFoundException(`User is not found.`);
        }

        return await user.update(dto,{transaction});
    }

    async updateMainPhoto(mainPhoto: Express.Multer.File,id:string,transaction:Transaction)
    {
      const user = await this.userRepository.findByPk(id);

      if(!user)
      {
        this.logger.error(`User is not found: ${id}`);
        throw new NotFoundException(`User is not found.`);
      }


      const media = await this.mediaService.createUserPhotoMedia(mainPhoto, transaction)
      .catch((error) => 
      {
          this.logger.error(`User main photo is not created:${error.message}`);
          throw new InternalServerErrorException("Error occured during main photo creation. Internal server error.");
      }); 
      await media.$set('userMainPhoto',user).catch((error) => 
      {
          this.logger.error(`User main photo is not created:${error.message}`);
          throw new InternalServerErrorException("Error occured during main photo creation. Internal server error.");
      });

      return media;

    }

    async updateProfilePhoto(profilePhoto: Express.Multer.File,id:string,transaction:Transaction)
    {
      const user = await this.userRepository.findByPk(id);

      if(!user)
      {
        this.logger.error(`User is not found: ${id}`);
        throw new NotFoundException(`User is not found.`);
      }

    
      const media = await this.mediaService.createUserPhotoMedia(profilePhoto, transaction)
      .catch((error) => 
      {
          this.logger.error(`User main photo is not created:${error.message}`);
          throw new InternalServerErrorException("Error occured during main photo creation. Internal server error.");
      }); 
      await media.$set('userProfilePhoto',user).catch((error) => 
      {
          this.logger.error(`User main photo is not created:${error.message}`);
          throw new InternalServerErrorException("Error occured during main photo creation. Internal server error.");
      });
      return media;

    }

    async getUserMedia(id:string,filters : DBQueryParameters,currentUserId:string)
    {
      const isSubscribed = !!(await this.subsRepository.findOne(
      {
        where:{[Op.or]:{subscriberId:currentUserId,subscribedUserId:id}}
      }).catch((e) => console.log(e)))
        || id === currentUserId;
  
      const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('Tweet.isComment'), { [Op.eq]: false } ),
                sequelize.where(sequelize.col('Tweet.authorId'), { [Op.eq]: id } ),             
            ]
      }
  
      if(filters.createdAt)
      {
          where[Op.and].push(sequelize.where(sequelize.col('Tweet.createdAt'), { [Op.lt]:filters.createdAt} ));
      }

      if(isSubscribed)
      {
        where[Op.and].push(sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.in]:[true, false]}));        
      }
      else
      {
        where[Op.and].push(sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.eq]:true}));        
      }

      const result = await this.tweetRepository.findAndCountAll({
        where,
        subQuery:false,
        limit:filters.limit,
        order:filters.order,
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

    /*#region Simple Get tweets methods */
    async getUserLikedTweets(id:string,filters : DBQueryParameters)
    {
      const where=
      {
          [Op.and]: 
          [
              sequelize.where(sequelize.col('isLiked.userId'), { [Op.eq]: id } ),
          ]
      }

      if(filters.createdAt)
      {
          where[Op.and].push(sequelize.where(sequelize.col('isLiked.createdAt'), { [Op.lt]:filters.createdAt} ));
      }

      const result = await this.tweetRepository.findAndCountAll({
          limit:filters.limit,
          include:
          [
            {model: LikedTweet,as:"isLiked", where,order:filters.order},
            {model: SavedTweet,as: 'isSaved',attributes:['tweetId'],required:false,where:{userId:id}},
            {
              model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
              where:{[Op.and]:{isComment:false,isPublic:true,authorId:id}}
            },
            ...countIncludes,
            ...tweetExtraIncludes
          ]
        }).catch(error =>
        {
          console.log(error);
        })

      return result;
    }
    
    async getUserSavedTweets(id:string,filters : DBQueryParameters)
    {
        const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('isSaved.userId'), { [Op.eq]: id } ),
            ]
        }

        if(filters.createdAt)
        {
            where[Op.and].push(sequelize.where(sequelize.col('isSaved.createdAt'), { [Op.lt]:filters.createdAt} ));
        }
        const result = await this.tweetRepository.findAndCountAll({
          limit:filters.limit,
          include:
          [
            {model: SavedTweet,as: 'isSaved', where,order:filters.order},
            {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false,where:{userId:id}},
            {
              model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
              where:{[Op.and]:{isComment:false,isPublic:true,authorId:id}}
            },
            ...countIncludes,
            ...tweetExtraIncludes
          ]
        }).catch(error =>
        {
          console.log(error);         
        })

      return result;
    }
        
    async getUserTweets(id:string,filters : DBQueryParameters,currentUserId:string)
    {
      const isSubscribed = !!(await this.subsRepository.findOne(
      {
        where:{[Op.or]:{subscriberId:currentUserId,subscribedUserId:id}}
      }).catch((e) => console.log(e)))
       || id === currentUserId;

      const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('Tweet.isComment'), { [Op.eq]: false } ),
                sequelize.where(sequelize.col('Tweet.authorId'), { [Op.eq]: id } ),             
            ]
      }

      if(filters.createdAt)
      {
          where[Op.and].push(sequelize.where(sequelize.col('Tweet.createdAt'), { [Op.lt]:filters.createdAt} ));
      }

      if(isSubscribed)
      {
        where[Op.and].push(sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.in]:[true, false]}));        
      }
      else
      {
        where[Op.and].push(sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.eq]:true}));        
      }

      const result = await this.tweetRepository.findAndCountAll({
        where,
        subQuery:false,
        limit:filters.limit,
        order:filters.order,
        include:
        [
          ...countIncludes,
          ...userActionIncludes(currentUserId),
          ...tweetExtraIncludes
        ]          
      })     
      .catch(error =>
      {
        console.log(error);         
      })

      return result;

    }

    async getUserTweetsAndReplies(id:string,filters : DBQueryParameters,currentUserId:string)
    {
      const isSubscribed = !!(await this.subsRepository.findOne(
        {
          where:{[Op.or]:{subscriberId:currentUserId,subscribedUserId:id}}
        })) || id === currentUserId;

      const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('Tweet.authorId'), { [Op.eq]: id } ),             
            ]
      }

      if(filters.createdAt)
      {
          where[Op.and].push(sequelize.where(sequelize.col('Tweet.createdAt'), { [Op.lt]:filters.createdAt} ));
      }

      if(isSubscribed)
      {
        where[Op.and].push(sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.in]:[true, false]}));        
      }
      else
      {
        where[Op.and].push(sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.eq]:true}));        
      }

      const result = await this.tweetRepository.findAndCountAll({
        where,
        limit:filters.limit,
        order:filters.order,
        include:
        [
          ...countIncludes,
          ...userActionIncludes(currentUserId),
          ...tweetExtraIncludes
        ]          
      })     
      .catch(error =>
      {
        console.log(error);         
      })

      return result;

    }

    async getUserFeed(id: string, filters : DBQueryParameters) 
    {
      const subscriptionsId = await this.subsRepository.findAll({where:{subscriberId:id}}).then((result)=>
      {
        return result.map((item) => item.subscribedUserId);
      });

      const where=
      {
          [Op.and]: 
          [
              sequelize.where(sequelize.col('Tweet.isComment'), { [Op.eq]: false } ),
              sequelize.where(sequelize.col('Tweet.authorId'), { [Op.in]:subscriptionsId}),    
              sequelize.where(sequelize.col('Tweet.isPublic'), { [Op.or]:[true,false]}),                   
          ]
      }

      if(filters.createdAt)
      {
          where[Op.and].push(sequelize.where(sequelize.col('Tweet.createdAt'), { [Op.lt]:filters.createdAt} ));
      }


      const result = await this.tweetRepository.findAndCountAll({
        where,
        distinct:true,
        limit:filters.limit,
        order:filters.order,
        include:
        [
          ...countIncludes,
          ...userActionIncludes(id),
          ...tweetExtraIncludes
        ]
      }).catch(error =>
      {
        console.log(error);    
      })

      return result;
    }
    /*#endregion*/
    async getFollowersRequests(id: string,filters : DBQueryParameters) 
    {
        const requests = await  this.subsRepository.findAndCountAll(
        {
            ...filters,
            where:
            {
                subscribedUserId:  id,
                isRejected: null
            },
            include:
            [{
              model: User,
              attributes: ['id','firstname','surname','email','city','country','sex'],
              include:
              [
                  {model:Media}
              ]
            }]
        })
        .catch((error) => {
            this.logger.error(`Requests are not found: ${error.message}`);

            throw new InternalServerErrorException("Requests are not found. Internal server error.");
        });

        return requests;
    }

    async getFollowingRequests(id: string,filters : DBQueryParameters) 
    {
        const requests = await this.subsRepository.findAndCountAll(
        {
            ...filters,
            where:
            {
                subscriberId:  id,
                isRejected: null
            },
            include:
            [{
              model: User,
              attributes: ['id','firstname','surname','email','city','country','sex'],
              include:
              [
                  {model:Media}
              ]
            }]
        })
        .catch((error) => {
            this.logger.error(`Requests are not found: ${error.message}`);
            throw new InternalServerErrorException("Requests are not found. Internal server error.");
        });

        return requests;
    }

    async getUserFollowers(id: string,filters : DBQueryParameters,currentUserId:string) 
    {
      const followers = await  this.subsRepository.findAndCountAll({
        where:{subscribedUserId:id},
        ...filters, 
        include: 
        [  
            {
                model:User,
                as:"subscriber",
                include:
                [
                    {model:UserCounts},
                    {model:Media,as:"mainPhoto",required:false},
                    {model:Subscription,as:"isSubscribed",required:false, where:{subscriberId:currentUserId}},
                ],
                attributes:['id','firstname','surname','description']
            },
        ],
      }).catch(e => console.log(e));
      return followers;
    }

    async getUserSubscriptions(id: string,filters : DBQueryParameters,currentUserId:string) 
    {
  
      const subscriptions = await  this.subsRepository.findAndCountAll({
        where:{subscriberId:id},
        ...filters, 
        include: 
        [  
            {
                model:User,
                as:"subscribedUser",
                include:
                [
                    {model:UserCounts},
                    {model:Media,as:"mainPhoto",required:false},
                    {model:Subscription,as:"isSubscribed",required:false,
                    on:{"subscriberId": {[Op.eq]:currentUserId}}}
                ],
                attributes:['id','firstname','surname','description']
            },
        ],
      }).catch(e => console.log(e));
      return subscriptions;
    }

    async getDialogsByUser(userId: string, filters: DBQueryParameters) 
    {
      const dialogs = await this.dialogRepository.findAndCountAll(
        {
          ...filters,
          include:
            [
              { 
                model:User,
                attributes:["id","createdAt","firstname","surname"],
                where:{id: {[Op.ne]: userId}},
                include:[{model:Media,as:"mainPhoto"}]
              },
              {
                model: Message, 
                include:[{model:Tweet, required:false}],
                attributes: ["createdAt", "text", "userId","messageTweetId"],
                order:[["createdAt", "DESC"]], 
                limit: 1
              },
              {
                model:UserDialog,
                attributes:['dialogId'],
                where:{userId}
              }
            ],
        })
        .catch((error) => {
          this.logger.error(`Dialogs are not found: ${error.message}`);
          throw new InternalServerErrorException("Dialogs are not found. Internal server error.");
        });
      return dialogs;
    }

    //Saved tweets
    async createSavedTweet(userId: string,tweetId:string) 
    {
        return await this.savedTweetRepository.create({userId,tweetId},{returning:true})
        .catch((error) =>
        {
          this.logger.error(`Tweet is not saved: ${error.message}`);
            throw new InternalServerErrorException('Tweet is not saved. Internal server error.')
        });
    }

    async deleteSavedTweetById(userId: string,tweetId:string)  
    {
        return await this.savedTweetRepository.destroy({where:{userId,tweetId}});
    }

    //Liked tweets
    async createLikedTweet(userId: string,tweetId:string) 
    {
        return await this.likedTweetRepository.create({userId,tweetId},{returning:true})
        .catch((error) =>
        {
          this.logger.error(`Tweet is not liked: ${error.message}`);
          throw new InternalServerErrorException('Tweet is not liked. Internal server error.')
        });
    }

    async deleteLikedTweetById(userId: string,tweetId:string) 
    {
        return await this.likedTweetRepository.destroy({where:{userId,tweetId}})
        .catch(e => console.log(e));
    }

    //Favorite messages
    async createFavoriteMessage(userId: string,messageId:string) 
    {
        return await this.favoriteMessageRepository.create({userId,messageId},{returning:true})
        .catch((error) =>
        {
          this.logger.error(`Message is not marked: ${error.message}`);
          throw new InternalServerErrorException('Message is not marked. Internal server error.')
        });
    }

    async deleteFavoriteMessage(userId: string,messageId:string) 
    {
        return await this.favoriteMessageRepository.destroy({where:{userId,messageId}})
        .catch(e => console.log(e));
    }
}
