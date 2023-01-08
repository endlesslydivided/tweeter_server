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
    
      async createTweetMedia(files: any, tweetRecordId: string, transaction: Transaction): Promise<any[]> {
        return files.map( async(file) => 
        {
            const path =  await this.filesService.createFile(file);
            const {name:originalName,description} = file;

            const attachment = await this.mediaRepository.create({ path, tweetRecordId,originalName,description }, { transaction })
            .catch(error => 
            { 
              console.log(error);
              throw new InternalServerErrorException("Error occured during creating media entry. Internal server error")
            });
            return attachment
            
          }
        );
      }
}
