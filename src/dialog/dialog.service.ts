import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize';
import { Media } from '../media/media.model';
import { Message } from '../message/message.model';
import RequestParameters from '../requestFeatures/request.params';
import { User } from '../user/user.model';
import { Dialog } from './dialog.model';
import { CreateDialogDto } from './dto/createDialog.dto';
import { UpdateDialogDto } from './dto/updateDialog.dto';

@Injectable()
export class DialogService {

    constructor(
        @InjectModel(Dialog) private dialogRepository: typeof Dialog,
        @InjectModel(Message) private messageRepository: typeof Message) {
      }
      async createDialog(dto: CreateDialogDto, transaction: Transaction) 
      {
    
        const { name,creatorUserId,companionUserId } = dto;
        const dialog = await this.dialogRepository.findOrCreate({where:{[Op.and]:{...dto}},defaults:dto,returning:true,transaction}).catch((error) => {
            throw new InternalServerErrorException("Dialog is not created. Internal server error");
            });

        await dialog[0].$set('users',[creatorUserId,companionUserId],{transaction}).catch((error) => {
            throw new InternalServerErrorException("Dialog is not created. Internal server error");
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
        if(!dialog) throw new NotFoundException("Dialog isn't found");
        return dialog;
      }
    
      async deleteDialog(id: string) 
      {
        return await this.dialogRepository.destroy({ where: { id } });
      }

      async getMessagesByDialog(dialogId: string, filters:RequestParameters) {
    
        const messages = await this.messageRepository.findAndCountAll({
            where:{dialogId},
            include:[{model: User,include:[{model:Media}]}],
            limit: filters.limit,
            offset: filters.offset,
            order: [["createdAt", "DESC"]]
        }).catch((error) =>
        {
          throw new InternalServerErrorException("Messages aren't found. Internal server error");
        });
        return messages;
      }
}
