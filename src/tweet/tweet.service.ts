import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException,NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Media } from 'src/media/media.model';
import { MediaService } from 'src/media/media.service';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { LikeTweetDTO } from './dto/likeTweet.dto';
import { SaveTweetDTO } from './dto/saveTweet.dto';
import { LikedTweet } from './likedTweet.model';
import { SavedTweet } from './savedTweet.model';
import { Tweet } from './tweet.model';

@Injectable()
export class TweetService {

    constructor(@InjectModel(Tweet) private tweetRepository: typeof Tweet,
                @Inject(forwardRef(() => MediaService)) private mediaService: MediaService,
                @InjectModel(LikedTweet) private likedTweetRepository: typeof LikedTweet,
                @InjectModel(SavedTweet) private savedTweetRepository: typeof SavedTweet,)
    {}

    //Tweet
    async createTweet(files:any[],dto: CreateTweetDTO,transaction:Transaction) 
    {       
        const tweet =  this.tweetRepository.create(dto,{transaction,returning:true})
        .catch((error) =>
        {
            throw new InternalServerErrorException('Tweet cannot be created. Internal server error.')
        });

        return tweet.then(async (resultTweet) =>
            {
              const mediaPromise = this.mediaService.createTweetMedia(files, resultTweet.id, transaction).catch((error) =>
              {
                throw new InternalServerErrorException("Error occured during media creation. Internal server error");
              });  
        
              return resultTweet;                 
            })
            .catch((error) => 
            {
              throw new InternalServerErrorException("Error occured during media creation. Internal server error");
            });   
      
    }

    async getTweetById(id: string) 
    {
        const tweet = await this.tweetRepository.findByPk(id);
        if(!tweet)
        {
            throw new NotFoundException(`Tweet isn't found.`)
        }
        return tweet;
    }

    async deleteTweetById(id: string) 
    {
        return await this.tweetRepository.destroy({where:{id}});
    }
 
    //Saved tweet
    async createSavedTweet(dto: SaveTweetDTO) 
    {
        return await this.savedTweetRepository.create(dto,{returning:true})
        .catch((error) =>
        {
            throw new InternalServerErrorException('Tweet cannot be saved. Internal server error.')
        });
    }

    async deleteSavedTweetById(id: string) 
    {
        return await this.savedTweetRepository.destroy({where:{id}});
    }

    //Liked tweet
    async createLikedTweet(dto: LikeTweetDTO) 
    {
        return await this.likedTweetRepository.create(dto,{returning:true})
        .catch((error) =>
        {
            throw new InternalServerErrorException('Tweet cannot be liked. Internal server error.')
        });
    }

    async deleteLikedTweetById(id: string) 
    {
        return await this.likedTweetRepository.destroy({where:{id}});
    }

}
