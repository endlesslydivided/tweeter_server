import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { CreateMessageDto } from './dto/createMessage.dto';
import { UpdateMessageDto } from './dto/updateMessage.dto';
import { Message } from './message.model';

@Injectable()
export class MessageService {

    constructor(
        @InjectModel(Message) private messageRepository: typeof Message,) {
      }

      
    async createMessage(dto: CreateMessageDto) 
    {   
      const message =  await this.messageRepository.create(dto, {returning:true}).catch((error) => {
        throw new InternalServerErrorException("Message is not updated.Internal server error");
      });
      return message;
    }
  
    async updateMessage(id: string, dto: UpdateMessageDto) {

      const message = await this.messageRepository.update(dto, { where: { id },returning:true }).catch((error) => {
        throw new InternalServerErrorException("Message is not updated.Internal server error");
      });
  
      return message;
    }

    async deleteMessage(id: string) 
    {
        return await this.messageRepository.destroy({ where: { id } });
    }
}
