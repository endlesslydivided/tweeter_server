import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize from 'sequelize';
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
import { UserDialog } from './userDialog.model';

@Injectable()
export class DialogService {

    private logger: Logger = new Logger('DialogService');

    constructor(
        @InjectModel(Subscription) private subsRepository: typeof Subscription,
        @InjectModel(Dialog) private dialogRepository: typeof Dialog,
        @InjectModel(UserDialog) private userDialogRepository: typeof UserDialog,
        @InjectModel(Message) private messageRepository: typeof Message) {
      }

    async createDialog(dto: CreateDialogDto, transaction: Transaction) 
    {  
      const { name,creatorId,companionId,isGroup } = dto;

      const subscriptionsCount = await this.subsRepository.count({where:
        {
          [Op.or]:
          [{subscriberId:creatorId,subscribedUserId:companionId},
          {subscriberId:companionId,subscribedUserId:creatorId}]
        }
      });

      if(subscriptionsCount < 2)
      {
        this.logger.error(`Only mutually subscribed users can exchange messages.`);

        throw new ForbiddenException("Only mutually subscribed users can exchange messages.")
      }

      const userDialogs = await this.userDialogRepository.findAll({
        where:{userId:{[Op.in]:[creatorId,companionId]}},
      });

      const commonDialogs = userDialogs.filter(d => userDialogs.some(u => d.dialogId === u.dialogId && d.userId !== u.userId));

      if(commonDialogs.length >= 1)
      {
        const dialog = await this.dialogRepository.findOne({where:{id:commonDialogs[0].dialogId}})
        .catch((error) => {
          this.logger.error(`Dialog is not found: ${error.message}`);
          throw new InternalServerErrorException("Dialog is not found. Internal server error.");
        });

        return dialog;  
      }
      else
      {
        const dialog = await this.dialogRepository.create({name,creatorId,isGroup},{transaction})
        .catch((error) => {
          this.logger.error(`Dialog is not created: ${error.message}`);
          throw new InternalServerErrorException("Dialog is not created. Internal server error.");
        });

        await dialog.$set('users',[creatorId,companionId],{transaction})
        .catch((error) => {
          this.logger.error(`Dialog is not created: ${error.message}`);
          throw new InternalServerErrorException("Dialog is not created. Internal server error.");
        });
    
        return dialog;
      } 
    }
  
    async updateDialog(id: string, dto: UpdateDialogDto) 
    {
      return await this.dialogRepository.update(dto, { where: { id },returning:true });     
    }
    
    async getDialogById(id: string,userId:string) 
    {
  
      const dialog = await this.dialogRepository.findByPk(id,
        {
          include:
          [
            { 
              model:User,
              attributes:["id","createdAt","firstname","surname"],
              where:{id: {[Op.ne]: userId}},
              include:[{model:Media,as:"mainPhoto"}]
            },
            {
              model: Message, 
              attributes: ["createdAt", "text", "userId"],
              order:[["createdAt", "DESC"]], 
              limit: 1
            },
            {
              model:UserDialog,
              attributes:['dialogId'],
              where:{userId}
            }
          ],
        });
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

    async getMessagesByDialog(dialogId: string, filters:any) {
  
      const where=
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('Message.dialogId'), { [Op.eq]: dialogId } ),
            ]
        }

        if(filters.createdAt)
        {
            where[Op.and].push(sequelize.where(sequelize.col('Message.createdAt'), { [Op.lt]:filters.createdAt} ));
        }

      const messages = await this.messageRepository.findAndCountAll({
          where,
          include:[{model: User,include:[{model:Media,as:'mainPhoto'}],attributes:["id","createdAt","firstname","surname"],}],
          limit:filters.limit,
          order:[[filters.orderBy,filters.orderDirection]],

          
        }).catch((error) =>
      {
        this.logger.error(`Messages are not found: ${error.message}`);
        throw new InternalServerErrorException("Messages are not found. Internal server error.");
      });
      return messages;
    }
}
