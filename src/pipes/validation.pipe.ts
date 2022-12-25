import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Transaction } from "sequelize";
import { ValidationException } from "../exception/validationException";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {

    if (!value || metadata.type === 'query' || metadata.type === 'custom'||value instanceof Transaction) {
      return value;
    } 
    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);

    if (errors.length) {
      let messages = errors.map(error => {
        return {
          property: error.property,
          message: Object.values(error.constraints).join(", ")
        };
      });
      throw new ValidationException(messages);
    }

    return value;
  }
}