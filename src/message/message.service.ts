import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { CreateMessageDto } from './dto/createMessage.dto';
import { UpdateMessageDto } from './dto/updateMessage.dto';
import { Message } from './message.model';

@Injectable()
export class MessageService {

    private logger: Logger = new Logger('MessageService');

    constructor(@InjectModel(Message) private messageRepository: typeof Message) {}

      
    async createMessage(dto: CreateMessageDto) 
    {   
      const message =  await this.messageRepository.create(dto, {returning:true}).catch((error) => {
        this.logger.error(`Message is not created: ${error}`);
        throw new InternalServerErrorException("Message is not created.Internal server error");
      });
      return message;
    }
  
    async updateMessage(id: string, dto: UpdateMessageDto) {

      const message = await this.messageRepository.update(dto, { where: { id },returning:true }).catch((error) => {
        this.logger.error(`Message is not updated: ${error}`);
        throw new InternalServerErrorException("Message is not updated.Internal server error");
      });
  
      return message;
    }

    async deleteMessage(id: string) 
    {
        return await this.messageRepository.destroy({ where: { id } });
    }
}
