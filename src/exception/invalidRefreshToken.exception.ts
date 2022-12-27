import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidRefreshTokenException extends HttpException {
  messages:string;

  constructor(response) {
    super(response, HttpStatus.FORBIDDEN);
    this.messages = response;
  }

}