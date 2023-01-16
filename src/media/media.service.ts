import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { FilesService } from '../files/files.service';
import { Media } from './media.model';

@Injectable()
export class MediaService {

    constructor(
        @InjectModel(Media) private mediaRepository: typeof Media,
        private filesService: FilesService) {
      }
    
      createTweetMedia(files: any, tweetRecordId: string,transaction: Transaction) 
      {
        return Promise.all(files.map( async(file) => 
        {
            const path = await this.filesService.createFile(file)
            .catch(error => 
              { 
                console.log(error);
                throw new InternalServerErrorException("Error occured during file writing. Internal server error")
              });;
            const {originalname:originalName,mimetype:type} = file;

            const attachment = await this.mediaRepository.create({ path, tweetRecordId,originalName,type }, { transaction })
            .catch(error => 
            { 
              throw new InternalServerErrorException("Error occured during creating media entry. Internal server error")
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
            console.log(error);
            throw new InternalServerErrorException("Error occured during file writing. Internal server error")
          });

        const {originalname:originalName,mimetype:type} = file;

        const userPhoto = await this.mediaRepository.create({ path, originalName,type }, { transaction })
        .catch(error => 
        { 
          throw new InternalServerErrorException("Error occured during creating media entry. Internal server error")
        });
        return userPhoto;              
    }
}
