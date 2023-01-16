import {  forwardRef, Inject, Injectable, InternalServerErrorException,NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { MediaService } from 'src/media/media.service';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { Tweet } from './tweet.model';

@Injectable()
export class TweetService {

    constructor(@InjectModel(Tweet) private tweetRepository: typeof Tweet,
                @Inject(forwardRef(() => MediaService)) private mediaService: MediaService,)
    {}

    //Tweet
    async createTweet(files:any[],dto: CreateTweetDTO,transaction:Transaction) 
    {       
        const tweet = await this.tweetRepository.create(dto,{transaction,returning:true})
        .catch((error) =>
        {
            throw new InternalServerErrorException('Tweet cannot be created. Internal server error.')
        });

        const media= await this.mediaService.createTweetMedia(files, tweet.id,transaction)
        .catch((error) => 
        {
            throw new InternalServerErrorException("Error occured during media creation. Internal server error");
        });   

        return tweet;
            
      
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
 
   

}
