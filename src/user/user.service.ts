import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { Dialog } from 'src/dialog/dialog.model';
import { UserDialog } from 'src/dialog/userDialog.model';
import { Media } from 'src/media/media.model';
import { Message } from 'src/message/message.model';
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
        const user = await  this.userRepository.findByPk(id, {include: 
          [
            {model:Media}
          ],
          attributes:['id','firstname','surname','email','city','country','sex','emailConfirmed']
        });

        const followersCount = await this.subsRepository.count({where:{subscribedUserId:id}});
        const subscriptionsCount = await this.subsRepository.count({where:{subscriberId:id}});

        return {user, followersCount, subscriptionsCount};
    }

    async getUsers(filters: RequestParameters) 
    {
       
        const users = await this.userRepository.findAndCountAll({
            limit: filters.limit,
            offset:filters.page *  filters.limit -  filters.limit,
            subQuery: false,
            order: [['createdAt','desc']],
            attributes:{exclude:['password','salt','accessFailedCount','emailConfirmed']}
        });
        return users;
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
          include:[{model:Tweet,attributes:['id'], where:{authorId:id}}],
          limit: filters.limit,
          offset:filters.page *  filters.limit -  filters.limit
        })

        return media;
    }

    async getUserLikedTweets(id:string,filters:RequestParameters)
    {
      const count = await this.tweetRepository.count({where:{authorId:id,isComment:false}});
      const tweetIds = await this.tweetRepository.sequelize.query(`select get_user_liked_tweets_ids(:userId,:offset,:limit) "id"`,
        {
          replacements: {userId:id,limit: filters.limit,offset:filters.page *  filters.limit -  filters.limit},
          type: QueryTypes.SELECT,
        }
      )
      .then(result =>result.map((x:{id:string}) => x.id))
      .catch((error) => {
        throw new InternalServerErrorException("User liked tweets aren't found. Internal server error");
      });

      const rows = await this.tweetRepository.findAll({
          where: {id:{[Op.in]:tweetIds}},
          include:[
            {model: Media,as:'tweetMedia'},
            {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ]
      })

      return {count,rows};
    }

    async getUserSavedTweets(id:string,filters:RequestParameters)
    {
      const count = await this.tweetRepository.count({where:{authorId:id,isComment:false}});
      const tweetIds = await this.tweetRepository.sequelize.query(`select get_user_saved_tweets_ids(:userId,:offset,:limit) "id"`,
        {
          replacements: {userId:id,limit: filters.limit,offset:filters.page *  filters.limit -  filters.limit},
          type: QueryTypes.SELECT,
        }
      )
      .then(result =>result.map((x:{id:string}) => x.id))
      .catch((error) => {
        throw new InternalServerErrorException("User saved tweets aren't found. Internal server error");
      });

      const rows = await this.tweetRepository.findAll({
          where: {id:{[Op.in]:tweetIds}},
          include:[
            {model: Media,as:'tweetMedia'},
            {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ]
      })

      return {count,rows};
    }

        
    async getUserTweets(id:string,filters:RequestParameters)
    {
      const count = await this.tweetRepository.count({where:{authorId:id,isComment:false}});
      const tweetIds = await this.tweetRepository.sequelize.query(`select get_user_tweets_ids(:authorId,:offset,:limit) "id"`,
        {
          replacements: {authorId:id,limit: filters.limit,offset:filters.page *  filters.limit -  filters.limit},
          type: QueryTypes.SELECT,
        }
      )
      .then(result =>result.map((x:{id:string}) => x.id))
      .catch((error) => {
        throw new InternalServerErrorException("User tweets aren't found. Internal server error");
      });

      const rows = await this.tweetRepository.findAll({
          where: {id:{[Op.in]:tweetIds}},
          include:[
            {model: Media,as:'tweetMedia'},
            {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
          ]
      })

      return {count,rows};
    }

    async getUserFeed(id: string, filters:RequestParameters) 
    {
      const count = await this.tweetRepository.sequelize.query(`select get_user_feed_tweets_count(:userId) "count"`,
        {
          replacements: {userId:id},
          type: QueryTypes.SELECT,
        }
      )
      .then((result:Array<{count:number}>) => result[0].count)
      .catch((error) => {
        throw new InternalServerErrorException("User feed tweets aren't found. Internal server error");
      });

      const tweetIds = await this.tweetRepository.sequelize.query(`select get_user_feed_tweets_ids(:authorId,:offset,:limit) "id"`,
        {
          replacements: {authorId:id,limit: filters.limit,offset:filters.page *  filters.limit -  filters.limit},
          type: QueryTypes.SELECT,
        }
      )
      .then(result =>result.map((x:{id:string}) => x.id))
      .catch((error) => {
        throw new InternalServerErrorException("User feed tweets aren't found. Internal server error");
      });

      const rows = await this.tweetRepository.findAll({
        where: {id:{[Op.in]:tweetIds}},
        include:[
          {model: Media,as:'tweetMedia'},
          {model: User,as:'author',include: [{model:Media}],attributes:["id","firstname","surname","country","city"]}
        ]
      })

      return {count,rows};
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
            throw new InternalServerErrorException("Requests aren't found. Internal server error");
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
            throw new InternalServerErrorException("Requests aren't found. Internal server error");
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

    //Saved tweets
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

    //Liked tweets
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
