import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import sequelize from 'sequelize';
import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
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
import { User } from './user.model';

@Injectable()
export class UserService {

    private logger: Logger = new Logger('UserService');

    constructor(@InjectModel(User) private userRepository: typeof User,
                @InjectModel(Subscription) private subsRepository: typeof Subscription,
                @InjectModel(Tweet) private tweetRepository: typeof Tweet,
                @InjectModel(Dialog) private dialogRepository: typeof Dialog,
                @InjectModel(Media) private mediaRepository: typeof Media,
                @InjectModel(LikedTweet) private likedTweetRepository: typeof LikedTweet,
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

    async getUserById(id: string) 
    {
        const user = await  this.userRepository.findByPk(id, {include: 
          [
            {model:Media}
          ],
          attributes:['id','firstname','surname','email','city','country','sex','emailConfirmed']
        });

        if(!user)
        {
          this.logger.error(`User is not found: ${id}`);
          throw new NotFoundException(`User is not found.`);
        }

        const followersCount = await this.subsRepository.count({where:{subscribedUserId:id}});
        const subscriptionsCount = await this.subsRepository.count({where:{subscriberId:id}});

        return {user, followersCount, subscriptionsCount};
    }

    async getUsers(filters: DBQueryParameters) 
    {    
        const users = await this.userRepository.findAndCountAll({
            ...filters, 
            include: 
              [
                {model:Media}
              ],
            subQuery: false,
            attributes:{exclude:['password','salt','accessFailedCount','emailConfirmed']}
        });
        return users;
    }

    async updateUserById(file:Express.Multer.File,id:string, dto: UpdateUserDTO,transaction:Transaction) 
    {
        const user = await this.userRepository.findByPk(id);

        if(!user)
        {
          this.logger.error(`User is not found: ${id}`);
          throw new NotFoundException(`User is not found.`);
        }

        if(file)
        {
            const media = await this.mediaService.createUserPhotoMedia(file, transaction)
            .catch((error) => 
            {
                this.logger.error(`User media is not created:${error.message}`);
                throw new InternalServerErrorException("Error occured during media creation. Internal server error.");
            }); 
            await media.$set('user',user);
        }

        return await user.update(dto,{transaction});
    }

    async getUserMedia(id:string,filters : DBQueryParameters)
    {
        const media = await this.mediaRepository.findAndCountAll({
          ...filters,
          distinct:true,
          include:
          [
            {
              model:Tweet,attributes:['id'], where:{authorId:id},
              include:
              [            
                {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
              ]
            },
          ],
        })

        return media;
    }

    /*#region Recursive Get tweets methods */
    // async getUserLikedTweets(id:string,filters : DBQueryParameters)
    // {
    //   const count = await this.tweetRepository.count({where:{authorId:id,isComment:false}});

    //   const {limit,offset,order} = filters;

    //   const tweetIds = await this.tweetRepository.sequelize.query(`select get_user_liked_tweets_ids(:userId,:offset,:limit) "id"`,
    //     {
    //       replacements: {userId:id,limit,offset},
    //       type: QueryTypes.SELECT,
    //     }
    //   )
    //   .then(result =>result.map((x:{id:string}) => x.id))
    //   .catch((error) => {
    //     this.logger.error(`User liked tweets are not found: ${error.message}`);
    //     throw new InternalServerErrorException("User liked tweets are not found. Internal server error.");
    //   });

    //   const rows = await this.tweetRepository.findAll({
    //       where: {id:{[Op.in]:tweetIds}},
    //       order,
    //       include:[
    //         {model: Media,as:'tweetMedia'},
    //         {model: SavedTweet,as: 'isSaved',attributes:['tweetId'],required:false},
    //         {
    //           model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
    //           where:{isComment:false,isPublic:true}
    //         },
    //         {model: Tweet,required:false,as:'parentRecord',include:
    //         [
    //           {model: Media,as:'tweetMedia'},
    //           {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]},

    //         ]},
    //         {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
    //       ]
    //   }).catch(error =>
    //     {
    //       error;
    //     })

    //   return {count,rows};
    // }

    // async getUserSavedTweets(id:string,filters : DBQueryParameters)
    // {
    //   const count = await this.tweetRepository.count({where:{authorId:id,isComment:false}});
      
    //   const {limit,offset,order} = filters;

    //   const tweetIds = await this.tweetRepository.sequelize.query(`select get_user_saved_tweets_ids(:userId,:offset,:limit) "id"`,
    //     {
    //       replacements: {userId:id,limit,offset},
    //       type: QueryTypes.SELECT,
    //     }
    //   )
    //   .then(result =>result.map((x:{id:string}) => x.id))
    //   .catch((error) => {
    //     this.logger.error(`User saved tweets are not found: ${error.message}`);
    //     throw new InternalServerErrorException("User saved tweets are not found. Internal server error.");
    //   });

    //   const rows = await this.tweetRepository.findAll({
    //       where: {id:{[Op.in]:tweetIds}},
    //       order,
    //       include:[
    //         {model: Media,as:'tweetMedia'},
    //         {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false},
    //         {
    //           model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
    //           where:{isComment:false,isPublic:true}
    //         },
    //         {model: Tweet,required:false,as:'parentRecord',include:
    //         [
    //           {model: Media,as:'tweetMedia'},
    //           {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]},

    //         ]},
    //         {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
    //       ]
    //   })

    //   return {count,rows};
    // }
        
    // async getUserTweets(id:string,filters : DBQueryParameters)
    // {
    //   const count = await this.tweetRepository.count({where:{authorId:id,isComment:false}});
      
    //   const {limit,offset,order} = filters;

    //   const tweetIds = await this.tweetRepository.sequelize.query(`select get_user_tweets_ids(:authorId,:offset,:limit) "id"`,
    //     {
    //       replacements: {authorId:id,limit,offset},
    //       type: QueryTypes.SELECT,
    //     }
    //   )
    //   .then(result =>result.map((x:{id:string}) => x.id))
    //   .catch((error) => {
    //     this.logger.error(`User tweets are not found: ${error.message}`);
    //     throw new InternalServerErrorException("User tweets are not found. Internal server error.");
    //   });

    //   const rows = await this.tweetRepository.findAll({
    //       where: {id:{[Op.in]:tweetIds}},
    //       order,
    //       include:
    //       [
    //         {model: Media,as:'tweetMedia'},
    //         {model: SavedTweet,as: 'isSaved',attributes:['tweetId'],required:false},
    //         {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false},
    //         {
    //           model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
    //           where:{isComment:false,isPublic:true}
    //         },
    //         {model: Tweet,required:false,as:'parentRecord',include:
    //         [
    //           {model: Media,as:'tweetMedia'},
    //           {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]},

    //         ]},
    //         {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
    //       ]
    //   }).catch((error) => {
    //     this.logger.error(`User saved tweets are not found: ${error.message}`);
    //     throw new InternalServerErrorException("User saved tweets are not found. Internal server error.");
    //   });

    //   return {count,rows};
    // }

    // async getUserFeed(id: string, filters : DBQueryParameters) 
    // {
    //   const count = await this.tweetRepository.sequelize.query(`select get_user_feed_tweets_count(:userId) "count"`,
    //     {
    //       replacements: {userId:id},
    //       type: QueryTypes.SELECT,
    //     }
    //   )
    //   .then((result:Array<{count:number}>) => result[0].count)
    //   .catch((error) => {
    //     this.logger.error(`User feed tweets are not found: ${error.message}`);
    //     throw new InternalServerErrorException("User feed tweets are not found. Internal server error.");
    //   });

    //   const {limit,offset,order} = filters;

    //   const tweetIds = await this.tweetRepository.sequelize.query(`select get_user_feed_tweets_ids(:authorId,:offset,:limit) "id"`,
    //     {
    //       replacements: {authorId:id,limit,offset},
    //       type: QueryTypes.SELECT,
    //     }
    //   )
    //   .then(result =>result.map((x:{id:string}) => x.id))
    //   .catch((error) => {
    //     this.logger.error(`User feed tweets are not found: ${error.message}`);
    //     throw new InternalServerErrorException("User feed tweets are not found. Internal server error.");
    //   });

    //   const rows = await this.tweetRepository.findAll({
    //     where: {id:{[Op.in]:tweetIds}},
    //     order,
    //     include:[
    //       {model: Media,as:'tweetMedia'},
    //       {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
    //     ]
    //   })

    //   return {count,rows};
    // }
    /*#endregion*/

    /*#region Simple Get tweets methods */
    async getUserLikedTweets(id:string,filters : DBQueryParameters)
    {
      const result = await this.tweetRepository.findAndCountAll({
          ...filters,
          where:{isComment:false},
          include:
          [
            {model: LikedTweet, where:{userId:id}},
            {model: Media,as:'tweetMedia'},
            {model: SavedTweet,as: 'isSaved',attributes:['tweetId'],required:false},
            {
              model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
              where:{isComment:false,isPublic:true}
            },
            {model: Tweet,required:false,as:'parentRecord',include:
            [
              {model: Media,as:'tweetMedia'},
              {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]},

            ]},
            {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ]
        }).catch(error =>
        {
          error;
        })

      return result;
    }
    
    async getUserSavedTweets(id:string,filters : DBQueryParameters)
    {
        const result = await this.tweetRepository.findAndCountAll({
          ...filters,
          where:{isComment:false},
          include:
          [
            {model: SavedTweet, where:{userId:id}},
            {model: Media,as:'tweetMedia'},
            {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false},
            {
              model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
              where:{isComment:false,isPublic:true}
            },
            {model: Tweet,required:false,as:'parentRecord',include:
            [
              {model: Media,as:'tweetMedia'},
              {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]},

            ]},
            {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ]
        }).catch(error =>
        {
          error;
        })

      return result;
    }
        
    async getUserTweets(id:string,filters : DBQueryParameters,currentUserId:string)
    {
        const result = await this.tweetRepository.findAndCountAll({
          where:{authorId:id,isComment:false},
          ...filters,
          include:
          [
            {model: Media,as:'tweetMedia'},
            {model: SavedTweet,as: 'isSaved',attributes:['tweetId'],required:false,where:{userId:currentUserId}},
            {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false,where:{userId:currentUserId}},
            {
              model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
              where:{isComment:false,isPublic:true,authorId:currentUserId}
            },
            {model: Tweet,required:false,as:'parentRecord',include:
            [
              {model: Media,as:'tweetMedia'},
              {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]},

            ]},
            {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ]
        }).catch(error =>
        {
          console.log(error);
          
        })

      return result;

    }

    async getUserFeed(id: string, filters : DBQueryParameters) 
    {
      const subscriptionsId = await this.subsRepository.findAll({where:{subscriberId:id}}).then((result)=>
      {
        return result.map((item) => item.id);
      });

      const result = await this.tweetRepository.findAndCountAll({
        ...filters,
        where:
        {
          id:
          {
            [Op.or]:
            {
              [Op.eq]:id,
              [Op.in]:subscriptionsId
            }
          },
          isComment:false
        },
        include:
        [
          {model: Media,as:'tweetMedia'},
          {model: SavedTweet,as: 'isSaved',attributes:['tweetId'],required:false,where:{userId:id}},
          {model: LikedTweet,as: 'isLiked',attributes:['tweetId'],required:false,where:{userId:id}},
        {
            model: Tweet,as: 'isRetweeted',required:false,on:{"parentRecordId": {[Op.eq]: Sequelize.col('Tweet.id')}},
            where:{isComment:false,isPublic:true}
          },
          {model: Tweet,required:false,as:'parentRecord',include:
          [
            {model: Media,as:'tweetMedia'},
            {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]},

          ]},
          {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
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

    async getUserFollowers(id: string,filters : DBQueryParameters) 
    {
  
      const result = await this.subsRepository.findAndCountAll(
        {
          ...filters,
          where:
          {
            subscribedUserId:  id,
            isRejected: false
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
          this.logger.error(`Followers are not found: ${error.message}`);
          throw new InternalServerErrorException("Followers are not found. Internal server error.");
        });
      return result;
    }

    async getUserSubscriptions(id: string,filters : DBQueryParameters) 
    {
  
      const result = await this.subsRepository.findAndCountAll(
        {
          ...filters,
          where:
          {
            subscriberId:  id,
            isRejected: false
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
          this.logger.error(`Subscriptions are not found: ${error.message}`);
          throw new InternalServerErrorException("Subscriptions are not found. Internal server error.",{cause:error});
        });
  
      return result;
    }

    async getDialogsByUser(userId: string, filters: DBQueryParameters) 
    {
  
      const dialogs = await this.dialogRepository.findAndCountAll(
        {
          ...filters,
          include:
            [
              { 
                model:User,attributes:["id","createdAt","firstname","surname"],where:{id: {[Op.ne]: userId}},include:[{model:Media}]
              },
              {
                model: Message, attributes: ["createdAt", "text", "userId"],order:[["createdAt", "DESC"]], limit: 1
              },
              {
                model:UserDialog,attributes:['dialogId'],where:{userId}
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
        return await this.likedTweetRepository.destroy({where:{userId,tweetId}});
    }
}
