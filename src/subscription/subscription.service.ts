import { Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize';
import { Media } from 'src/media/media.model';
import DBQueryParameters from 'src/requestFeatures/dbquery.params';
import { User } from 'src/user/user.model';
import { UserCounts } from 'src/user/userCounts.model';
import { CreateSubsriptionDTO } from './dto/createSubscription.dto';
import { UpdateSubscriptionDTO } from './dto/updateSubscription.dto';
import { Subscription } from './subscription.model';

const countIncludes = [
    {model: UserCounts}
]

@Injectable()
export class SubscriptionService {

    private logger: Logger = new Logger('SubscriptionService');

    constructor(@InjectModel(Subscription) private subsRepository: typeof Subscription){}

    async createSubscription(dto: CreateSubsriptionDTO,transaction:Transaction) 
    {       
        return await this.subsRepository.findOrCreate({where:{[Op.and]:{...dto}},defaults:dto,transaction,returning:true})
        .catch((error) =>
        {
            this.logger.error(`Subscription is not created: ${error.message}`);
            throw new InternalServerErrorException('Subscription is not created. Internal server error.')
        });
    }

    async getSubscriptionById(id: string) 
    {
        const subscription = await this.subsRepository.findByPk(id);
        if(!subscription)
        {
            this.logger.error(`Subscription is not found: ${id}`);
            throw new NotFoundException(`Subscription is not found.`)
        }
        return subscription;
    }

    async getSubscriptions(currentUserId:string,filters: DBQueryParameters) 
    {
        const subscriptions = await  this.subsRepository.findAll({
            ...filters, 
            include: 
            [  
                {
                    model:User,
                    include:
                    [
                        ...countIncludes,
                        {model:Media,as:"mainPhoto",required:false},
                        {model:Subscription,as:"isSubscribed",required:false, where:{[Op.and]:{subscriberId:currentUserId}}},
                    ],
                    attributes:['id','firstname','surname','description']
                },
            ],
          }).catch(e => console.log(e));
        return subscriptions;
    }

    async updateSubscription(id: string,dto: UpdateSubscriptionDTO)
    {
        const subscription = await this.subsRepository.findByPk(id);
        await subscription.update(dto).catch((error) =>
        {
            this.logger.error(`Subscription is not updated: ${error.message}`);
            throw new InternalServerErrorException('Subscription is not updated. Internal server error.')
        });;

        return subscription
    }

    async deleteSubscriptionById(subscriberId: string,subscribedUserId:string) 
    {
        return await this.subsRepository.destroy({where:{[Op.and]:{subscriberId,subscribedUserId}}});
    }
}
