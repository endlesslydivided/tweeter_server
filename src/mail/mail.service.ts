import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDTO } from 'src/user/dto/createUser.dto';

@Injectable()
export class MailService {

    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation(user: CreateUserDTO, emailToken: string) {
      const url = `http://localhost:${process.env.PORT}/api/auth/confirm?token=${emailToken}`;
  
      await this.mailerService.sendMail(
    {
        to: user.email,
        from: '"Служба поддержки" <support@example.com>', 
        subject: 'Добро пожаловать в Tweeter! Необходимо подтвердить свою почту.',
        text:`Здравйствуйте,${user.surname} ${user.firstname}.\n\n Для подтверждения почты перейдите по ссылке:\n ${url}`
      });
    }

}
