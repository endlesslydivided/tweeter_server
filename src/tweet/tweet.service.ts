import { BadRequestException, Injectable, InternalServerErrorException,NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { Tweet } from './tweet.model';

@Injectable()
export class TweetService {

    constructor(@InjectModel(Tweet) private tweetRepository: typeof Tweet)
    {}

    async createTweet(dto: CreateTweetDTO,transaction:Transaction) 
    {       
        return await this.tweetRepository.create(dto,{transaction,returning:true})
        .catch((error) =>
        {
            throw new InternalServerErrorException('Tweet cannot be created. Internal server error.')
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

}
