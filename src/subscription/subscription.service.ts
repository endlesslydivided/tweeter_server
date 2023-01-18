import { Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize';
import { CreateSubsriptionDTO } from './dto/createSubscription.dto';
import { UpdateSubscriptionDTO } from './dto/updateSubscription.dto';
import { Subscription } from './subscription.model';

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

    async deleteSubscriptionById(id: string) 
    {
        return await this.subsRepository.destroy({where:{id}});
    }
}
