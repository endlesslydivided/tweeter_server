import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { Sequelize, Transaction } from 'sequelize';
import { Op } from 'sequelize';
import { Media } from 'src/media/media.model';
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
                @InjectModel(Media) private mediaRepository: typeof Media,)
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
        return await this.userRepository.findByPk(id, {include: [
            {model:Subscription,where:{subscriberId:id},attributes:["id"],as:"following"},
            {model:Subscription,where:{subscribedUserId:id},attributes:["id"],as:"followers"},
            {model:Media}
        ],
        attributes:[
           [Sequelize.fn("COUNT", Sequelize.col("following.id")), "following"],
           [Sequelize.fn("COUNT", Sequelize.col("followers.id")), "followers"],
            'id',
            'firstName',
            'surname',
            'email',
            'city','country',
            'sex',    
            'emailConfirmed',
            'mainPhoto']
        });
    }

    async getUsers(filters: FilterUserParams) 
    {
        const whereClause = 
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('country'), { [Op.like]: `%${filters.country}%` } ),
                sequelize.where(sequelize.col('sex'), { [Op.like]: `%${filters.sex}%` } ),
                sequelize.where(sequelize.col('city'), { [Op.like]: `%${filters.city}%` } ),
                sequelize.where(sequelize.col('photo.path'), filters.havePhoto === 'true' ?  {[Op.ne]: null} : {[Op.or]:{[Op.eq]: null,[Op.ne]: null}} )
            ]
        }
        const users = await this.userRepository.findAndCountAll({
            limit: filters.limit,
            offset: filters.offset,
            subQuery: false,
            where: whereClause,
            order: [[filters.orderBy,filters.orderDirection]]
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
            include:[
                {model:Tweet,attributes:['id'], where:{authorId:id}}],
            limit: filters.limit,
            offset: filters.offset
        })

        return media;
    }

    async getUserLikedTweets(id:string,filters:RequestParameters)
    {
        const likedTweets = await this.tweetRepository.findAndCountAll({
            include:[{model:LikedTweet,where:{userId:id}},Media],
            limit: filters.limit,
            offset: filters.offset
        })

        return likedTweets;
    }

    async getUserSavedTweets(id:string,filters:RequestParameters)
    {
        const savedTweets = await this.tweetRepository.findAndCountAll({
            include:[{model:SavedTweet,where:{userId:id}},Media],
            limit: filters.limit,
            offset: filters.offset
        }).catch((error) => {
          throw new InternalServerErrorException("User saved tweets aren't found. Internal server exception");
        });

        return savedTweets;
    }

        
    //TODO: EDIT TO FIND TWEETS HIERARCHICALLY
    async getUserTweets(id:string,filters:RequestParameters)
    {
        const likedTweets = await this.tweetRepository.findAndCountAll({
            where: {authorId:id},
            include:[Media],
            limit: filters.limit,
            offset: filters.offset
        }).catch((error) => {
          throw new InternalServerErrorException("User tweets aren't found. Internal server exception");
        });

        return likedTweets;
    }

    //TODO: EDIT TO FIND TWEETS HIERARCHICALLY
    async getUserFeed(id: string, filters:RequestParameters) 
    {
      const user = await this.getUserById(id).catch((error) => {
        throw new InternalServerErrorException("User feed isn't found. Internal server error.");
      });
  
      if(!user) throw new NotFoundException("User feed isn't found: user doesn't exists");
  
  
      const friendsIds = user.subscriptions.map(x => x.id);

      const feed = await this.tweetRepository.findAndCountAll(
        {
          include: 
          [{
            model: Media,
          },
          {
            model: User,
            include:
            [
              {model:Media}
            ]
          }],
          where: { 
            authorId: 
            {[Op.or]:
              {
                [Op.in] : friendsIds,
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
            offset: filters.offset,
            where:
            {
                subscribedUserId:  id,
                isRejected: null
            },
            include:
            [{
              model: User,
              attributes: ['id','firstName','surname','email','city','country','sex','mainPhoto'],
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
            offset: filters.offset,
            where:
            {
                subscriberId:  id,
                isRejected: null
            },
            include:
            [{
              model: User,
              attributes: ['id','firstName','surname','email','city','country','sex','mainPhoto'],
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
          offset: filters.offset,
          where:
          {
            subscribedUserId:  id,
            isRejected: false 
            
          },
          include:
          [{
            model: User,
            attributes: ['id','firstName','surname','email','city','country','sex','mainPhoto'],
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
          offset: filters.offset,
          where:
          {
            subscriberId:  id,
            isRejected: false          
          },
          include:
          [{
            model: User,
            attributes: ['id','firstName','surname','email','city','country','sex','mainPhoto'],
            include:
            [
              {model:Media}
            ]
          }],
          order: [["createdAt", "DESC"]]
        })
        .catch((error) => {
          throw new InternalServerErrorException("Subscribtions aren't found. Internal server error");
        });
  
      return result;
    }
}
