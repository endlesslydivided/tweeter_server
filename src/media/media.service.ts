import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { FilesService } from '../files/files.service';
import { Media } from './media.model';

@Injectable()
export class MediaService {


    private logger: Logger = new Logger('MediaService');

    constructor(
        @InjectModel(Media) private mediaRepository: typeof Media,
        private filesService: FilesService) {
      }

      fDataFormat = (fileName:string) => {

        let audioFormats = /(\.mp3|\.wav)$/i;
        let videoFormats = /(\.mp4|\.webm)$/i;
        let imageFormats = /(\.apng|\.gif|\.ico|\.cur|\.jpg|\.jpeg|\.jfif|\.pjpeg|\.pjp|\.png|\.svg)$/i;
    
        if(!!(fileName as string).match(audioFormats))
        {
            return 'audio';
        }
        else if(!!(fileName as string).match(videoFormats))
        {
            return 'video';
        }
        else if(!!(fileName as string).match(imageFormats))
        {
            return 'image';
        }
        else
        {
            return 'document';
        }
    }
    
      createTweetMedia(files: any, tweetRecordId: string,transaction: Transaction) 
      {
        return Promise.all(files.map( async(file) => 
        {
            const path = await this.filesService.createFile(file)
            .catch(error => 
              { 
                this.logger.error(`Error occured during file writing: ${error.message}`);
                throw new InternalServerErrorException("Error occured during file writing. Internal server error.")
              });;
              
            const originalName =Buffer.from(file.originalname, 'latin1').toString();
            const type = this.fDataFormat(file.originalname)
            const attachment = await this.mediaRepository.create({ path, tweetRecordId,originalName,type }, { transaction })
            .catch(error => 
            { 
              this.logger.error(`Error occured during creating media entry: ${error.message}`);
              throw new InternalServerErrorException("Error occured during creating media entry. Internal server error.")
            });
            return attachment;          
          }
        ));
      }

      createMessageMedia(files: any, messageRecordId: string,transaction: Transaction) 
      {
        return Promise.all(files.map( async(file) => 
        {
            const path = await this.filesService.createFile(file)
            .catch(error => 
              { 
                this.logger.error(`Error occured during file writing: ${error.message}`);
                throw new InternalServerErrorException("Error occured during file writing. Internal server error.")
              });;
              
            const originalName =Buffer.from(file.originalname, 'latin1').toString();
            const type = this.fDataFormat(file.originalname)

            const attachment = await this.mediaRepository.create({ path, messageRecordId,originalName,type }, { transaction })
            .catch(error => 
            { 
              this.logger.error(`Error occured during creating media entry: ${error.message}`);
              throw new InternalServerErrorException("Error occured during creating media entry. Internal server error.")
            });
            return attachment;          
          }
        ));
      }

      async createUserPhotoMedia(file: any, transaction: Transaction) 
      {
        const path = await this.filesService.createFile(file)
        .catch(error => 
          { 
            this.logger.error(`Error occured during file writing: ${error.message}`);
            throw new InternalServerErrorException("Error occured during file writing. Internal server error.")
          });

        const {originalname:originalName} = file;
        const type = this.fDataFormat(originalName)

        const userPhoto = await this.mediaRepository.create({ path, originalName,type }, { transaction })
        .catch(error => 
        { 
          this.logger.error(`Error occured during creating media entry: ${error.message}`);
          throw new InternalServerErrorException("Error occured during creating media entry. Internal server error.")
        });
        return userPhoto;              
    }
}
