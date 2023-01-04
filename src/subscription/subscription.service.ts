import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { CreateSubsriptionDTO } from './dto/createSubscription.dto';
import { UpdateSubscriptionDTO } from './dto/updateSubscription.dto';
import { Subscription } from './subscription.model';

@Injectable()
export class SubscriptionService {

    constructor(@InjectModel(Subscription) private subsRepository: typeof Subscription)
    {}

    async createSubscription(dto: CreateSubsriptionDTO,transaction:Transaction) 
    {       
        return await this.subsRepository.create(dto,{transaction,returning:true})
        .catch((error) =>
        {
            throw new InternalServerErrorException('Subscription cannot be created. Internal server error.')
        });
    }

    async getSubscriptionById(id: string) 
    {
        const tweet = await this.subsRepository.findByPk(id);
        if(!tweet)
        {
            throw new NotFoundException(`Subscription isn't found.`)
        }
        return tweet;
    }

    async updateSubscription(id: string,dto: UpdateSubscriptionDTO)
    {
        const tweet = await this.subsRepository.findByPk(id);
        if(!tweet)
        {
            throw new NotFoundException(`Subscription isn't found.`)
        }
        await tweet.update(dto).catch((error) =>
        {
            throw new InternalServerErrorException('Subscription cannot be updated. Internal server error.')
        });;

        return tweet
    }

    async deleteSubscriptionById(id: string) 
    {
        return await this.subsRepository.destroy({where:{id}});
    }
}
