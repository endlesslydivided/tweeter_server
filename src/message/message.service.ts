import { forwardRef, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import sequelize, { Sequelize } from 'sequelize';
import { Transaction } from 'sequelize';
import { Media } from 'src/media/media.model';
import { MediaService } from 'src/media/media.service';
import { User } from 'src/user/user.model';
import { CreateMessageDto } from './dto/createMessage.dto';
import { UpdateMessageDto } from './dto/updateMessage.dto';
import { Message } from './message.model';

@Injectable()
export class MessageService {

    private logger: Logger = new Logger('MessageService');

    constructor(@InjectModel(Message) private messageRepository: typeof Message,
    @Inject(forwardRef(() => MediaService)) private mediaService: MediaService,
    @InjectConnection() private readonly sequelizeInstance: Sequelize) {}

      
    async createMessage(files: Array<any>,dto: CreateMessageDto) 
    {   

      const transaction: Transaction = await this.sequelizeInstance.transaction();

      const message =  await this.messageRepository.create(dto, {returning:true,transaction})
        .catch((error) => {
        this.logger.error(`Message is not created: ${error.message}`);
        transaction.rollback();
        throw new InternalServerErrorException("Message is not created.Internal server error");
      }); 

      if(files && files.length !== 0)
      {
          await this.mediaService.createMessageMedia(files, message.id,transaction)
          .catch((error) => 
          {
              this.logger.error(`Message is not created:${error.message}`);
              transaction.rollback();
              throw new InternalServerErrorException("Error occured during media creation. Internal server error.");
          });  
      }
      return message;
    }
  
    async updateMessage(id: string, dto: UpdateMessageDto) {

      const message = await this.messageRepository.update(dto, { where: { id },returning:true }).catch((error) => {
        this.logger.error(`Message is not updated: ${error.message}`);
        throw new InternalServerErrorException("Message is not updated.Internal server error");
      });
  
      return message;
    }

    async deleteMessage(id: string) 
    {
        return await this.messageRepository.destroy({ where: { id } });
    }
}
