import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize';
import DBQueryParameters from 'src/requestFeatures/dbquery.params';
import { Subscription } from 'src/subscription/subscription.model';
import { Media } from '../media/media.model';
import { Message } from '../message/message.model';
import { User } from '../user/user.model';
import { Dialog } from './dialog.model';
import { CreateDialogDto } from './dto/createDialog.dto';
import { UpdateDialogDto } from './dto/updateDialog.dto';

@Injectable()
export class DialogService {

    private logger: Logger = new Logger('DialogService');

    constructor(
        @InjectModel(Subscription) private subsRepository: typeof Subscription,
        @InjectModel(Dialog) private dialogRepository: typeof Dialog,
        @InjectModel(Message) private messageRepository: typeof Message) {
      }

    async createDialog(dto: CreateDialogDto, transaction: Transaction) 
    {  
      const { name,creatorUserId,companionUserId } = dto;

      const subscriptionsCount = await this.subsRepository.count({where:
        {
          [Op.or]:
          [{subscriberId:creatorUserId,subscribedUserId:companionUserId},
          {subscriberId:companionUserId,subscribedUserId:creatorUserId}]
        }
      });

      if(subscriptionsCount < 2)
      {
        this.logger.error(`Only mutually subscribed users can exchange messages.`);

        throw new ForbiddenException("Only mutually subscribed users can exchange messages.")
      }

      const dialog = await this.dialogRepository.findOrCreate({where:{[Op.and]:{...dto}},defaults:dto,returning:true,transaction}).catch((error) => {
        this.logger.error(`Dialog is not created: ${error.message}`);
        throw new InternalServerErrorException("Dialog is not created. Internal server error.");
      });

      await dialog[0].$set('users',[creatorUserId,companionUserId],{transaction}).catch((error) => {
        this.logger.error(`Dialog is not created: ${error.message}`);
        throw new InternalServerErrorException("Dialog is not created. Internal server error.");
      });
    
      return dialog[0];
    }
  
    async updateDialog(id: string, dto: UpdateDialogDto) 
    {
      return await this.dialogRepository.update(dto, { where: { id },returning:true });     
    }
    
    async getDialogById(id: string) 
    {
      const dialog = await this.dialogRepository.findByPk(id,{include: {model: User, attributes:['id','firstname','surname'],include:[Media]}});
      if(!dialog) 
      {
        this.logger.error(`Dialog is not found: ${id}`);
        throw new NotFoundException("Dialog is not found");
      }
      return dialog;
    }
  
    async deleteDialog(id: string) 
    {
      return await this.dialogRepository.destroy({ where: { id } });
    }

    async getMessagesByDialog(dialogId: string, filters:DBQueryParameters) {
  
      const messages = await this.messageRepository.findAndCountAll({
          where:{dialogId},
          include:[{model: User,include:[{model:Media}]}],
          ...filters
      }).catch((error) =>
      {
        this.logger.error(`Messages are not found: ${error.message}`);
        throw new InternalServerErrorException("Messages are not found. Internal server error.");
      });
      return messages;
    }
}
