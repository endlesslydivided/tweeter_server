import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Dialog } from 'src/dialog/dialog.model';
import { UserDialog } from 'src/dialog/userDialog.model';
import { Media } from 'src/media/media.model';
import { Message } from 'src/message/message.model';
import { FilterUserParams } from 'src/requestFeatures/filterUser.params';
import RequestParameters from 'src/requestFeatures/request.params';
import { Subscription } from 'src/subscription/subscription.model';
import { LikedTweet } from 'src/tweet/likedTweet.model';
import { SavedTweet } from 'src/tweet/savedTweet.model';
import { Tweet } from 'src/tweet/tweet.model';
import { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { User } from './user.model';

@Injectable()
export class UserService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                @InjectModel(Subscription) private subsRepository: typeof Subscription,
                @InjectModel(Tweet) private tweetRepository: typeof Tweet,
                @InjectModel(Dialog) private dialogRepository: typeof Dialog,
                @InjectModel(Media) private mediaRepository: typeof Media,
                @InjectModel(LikedTweet) private likedTweetRepository: typeof LikedTweet,
                @InjectModel(SavedTweet) private savedTweetRepository: typeof SavedTweet)
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
        const user = await  this.userRepository.findByPk(id, {include: [
            {model:Media}
        ],
        attributes:[
            'id',
            'firstname','surname',
            'email',
            'city','country',
            'sex',    
            'emailConfirmed']
        });

        const followersCount = await this.subsRepository.count({where:{subscribedUserId:id}});
        const subscriptionsCount = await this.subsRepository.count({where:{subscriberId:id}});

        return {user, followersCount, subscriptionsCount};
    }

    async getUsers(filters: FilterUserParams) 
    {
       
        const users = await this.userRepository.findAndCountAll({
            limit: filters.limit,
            offset:filters.page *  filters.limit -  filters.limit,
            subQuery: false,
            order: [['createdAt','desc']],
            attributes:{exclude:['password','salt','accessFailedCount','emailConfirmed']}
        })
        return  users;
    }

    async updateUserById(id:string, dto: UpdateUserDTO) 
    {
        const user = await this.userRepository.findByPk(id);

        return user.update(dto);
    }

    async getUserMedia(id:string,filters:RequestParameters)
    {
        const media = await this.mediaRepository.findAndCountAll({
          distinct:true,
          include:[
              {model:Tweet,attributes:['id'], where:{authorId:id}}],
          limit: filters.limit,
          offset:filters.page *  filters.limit -  filters.limit
        })

        return media;
    }

    async getUserLikedTweets(id:string,filters:RequestParameters)
    {
        const likedTweets = await this.tweetRepository.findAndCountAll({
          distinct: true,
          include:
          [
            {model:LikedTweet,where:{userId:id},attributes:[],},
            {model:Media,attributes:{exclude:["id","tweetRecordId","userId","updatedAt",]}},
            {model:User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ],
          attributes:{exclude:["updatedAt"]},
          limit: filters.limit,
          offset:filters.page *  filters.limit -  filters.limit
        })

        return likedTweets;
    }

    async getUserSavedTweets(id:string,filters:RequestParameters)
    {
        const savedTweets = await this.tweetRepository.findAndCountAll({
          distinct: true,
          include:
          [
            {model:SavedTweet,where:{userId:id},attributes:[],},
            {model:Media,attributes:{exclude:["id","tweetRecordId","userId","updatedAt",]}},
            {model:User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ],
          limit: filters.limit,
          offset:filters.page *  filters.limit -  filters.limit
        }).catch((error) => {
          throw new InternalServerErrorException("User saved tweets aren't found. Internal server exception");
        });

        return savedTweets;
    }

        
    //TODO: EDIT TO FIND TWEETS HIERARCHICALLY
    async getUserTweets(id:string,filters:RequestParameters)
    {
        const tweets = await this.tweetRepository.findAndCountAll({
            where: {authorId:id},
            distinct: true,
            include:[
              {model: Media,as:'tweetMedia'},
              {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
            ],
            limit: filters.limit,
            offset:filters.page *  filters.limit -  filters.limit
        }).catch((error) => {
          throw new InternalServerErrorException("User tweets aren't found. Internal server exception");
        });

        return tweets;
    }

    //TODO: EDIT TO FIND TWEETS HIERARCHICALLY
    async getUserFeed(id: string, filters:RequestParameters) 
    {
      const subscriptions = await this.subsRepository.findAll({where:{subscriberId:id},attributes:['subscribedUserId']});

      const subscriptionsIds = subscriptions.map(x => x.subscribedUserId);

      const feed = await this.tweetRepository.findAndCountAll(
        {
          distinct:true,
          include: 
          [
            {model: Media,},
            {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ],
          where: 
          { 
            authorId: 
            {[Op.or]:
              {
                [Op.in] : subscriptionsIds,
                [Op.eq] : id
              }    
            } },
          limit: filters.limit,
          offset: filters.page *  filters.limit -  filters.limit,
          order: [["createdAt", "DESC"]]
        }).catch((error) => {
          throw new InternalServerErrorException("User feed isn't found. Internal server error/")
        });
        
        return feed;
      }

    async getFollowersRequests(id: string,filters:RequestParameters) 
    {
        const requests = await  this.subsRepository.findAndCountAll(
        {
            limit: filters.limit, 
            offset:filters.page *  filters.limit -  filters.limit,
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
            }],
            order: [["createdAt", "DESC"]]
        })
        .catch((error) => {
            throw new InternalServerErrorException("Requests aren't found. Internal server exception");
        });

        return requests;
    }

    async getFollowingRequests(id: string,filters:RequestParameters) 
    {
        const requests = await  this.subsRepository.findAndCountAll(
        {
            limit: filters.limit, 
            offset:filters.page *  filters.limit -  filters.limit,
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
            }],
            order: [["createdAt", "DESC"]]
        })
        .catch((error) => {
            throw new InternalServerErrorException("Requests aren't found. Internal server exception");
        });

        return requests;
    }


    async getUserFollowers(id: string,filters:RequestParameters) 
    {
  
      const result = await this.subsRepository.findAndCountAll(
        {
          limit: filters.limit, 
          offset:filters.page *  filters.limit -  filters.limit,
          where:
          {
            subscribedUserId:  id
          },
          include:
          [{
            model: User,
            attributes: ['id','firstname','surname','email','city','country','sex'],
            include:
            [
              {model:Media}
            ]
          }],
          order: [["createdAt", "DESC"]]
        })
        .catch((error) => {
          throw new InternalServerErrorException("Followers aren't found. Internal server error/");
        });
      return result;
    }

    async getUserSubscribtions(id: string,filters:RequestParameters) 
    {
  
      const result = await this.subsRepository.findAndCountAll(
        {
          limit: filters.limit, 
          offset:filters.page *  filters.limit -  filters.limit,
          where:
          {
            subscriberId:  id
          },
          include:
          [{
            model: User,
            attributes: ['id','firstname','surname','email','city','country','sex'],
            include:
            [
              {model:Media}
            ]
          }],
          order: [["createdAt", "DESC"]]
        })
        .catch((error) => {
          throw new InternalServerErrorException("Subscribtions aren't found. Internal server error",{cause:error});
        });
  
      return result;
    }

    
    async getDialogsByUser(userId: string, filters: RequestParameters) 
    {
  
      const dialogs = await this.dialogRepository.findAndCountAll(
        {
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
          limit: filters.limit,
          offset: filters.page *  filters.limit -  filters.limit,
          order: [["createdAt", "DESC"]]
        })
        .catch((error) => {
          throw new InternalServerErrorException("Dialogs aren't found. Internal server error");
        });
      return dialogs;
    }

     //Saved tweet
     async createSavedTweet(userId: string,tweetId:string) 
     {
         return await this.savedTweetRepository.create({userId,tweetId},{returning:true})
         .catch((error) =>
         {
             throw new InternalServerErrorException('Tweet cannot be saved. Internal server error.')
         });
     }
 
     async deleteSavedTweetById(userId: string,tweetId:string)  
     {
         return await this.savedTweetRepository.destroy({where:{userId,tweetId}});
     }
 
     //Liked tweet
     async createLikedTweet(userId: string,tweetId:string) 
     {
         return await this.likedTweetRepository.create({userId,tweetId},{returning:true})
         .catch((error) =>
         {
             throw new InternalServerErrorException('Tweet cannot be liked. Internal server error.')
         });
     }
 
     async deleteLikedTweetById(userId: string,tweetId:string) 
     {
         return await this.likedTweetRepository.destroy({where:{userId,tweetId}});
     }
}
