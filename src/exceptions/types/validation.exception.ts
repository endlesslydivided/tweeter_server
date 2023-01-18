import { HttpException, HttpStatus } from "@nestjs/common";

export class ValidationException extends HttpException {
  
  messages:string;
  entityErrors:string;

  constructor(response,entityErrors) {
    super(response, HttpStatus.BAD_REQUEST);
    this.messages = response;
    this.entityErrors = entityErrors;
  }

}