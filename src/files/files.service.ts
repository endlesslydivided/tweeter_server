import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import * as uuid from "uuid";
import { isInstance } from "class-validator";

@Injectable()
export class FilesService {

  async createFile(file: any): Promise<string> {
    try {
      const fileName = uuid.v4() + path.extname(file.originalName.toString());
      const filePath = path.resolve(__dirname, "..", "static");
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      fs.writeFileSync(path.join(filePath, fileName), file.buffer);
      return fileName;
    } 
    catch (e) 
    {
      throw new InternalServerErrorException("An error occured during file writing");
    }
  }

  async readFile(fileName): Promise<Buffer> {
    try 
    {
      const filePath = path.resolve(__dirname, "..", "static");
      const file = path.join(filePath, fileName);
      if (!fs.existsSync(file)) {
        return fs.readFileSync(file);
      } else {
        throw new NotFoundException("File doesn't exist");
      }

    } 
    catch (e) {
      if (isInstance(e, HttpException)) {
        throw e;
      }
      throw new InternalServerErrorException("An error occured during file reading");
    }
  }
}
