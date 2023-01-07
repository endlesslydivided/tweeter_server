import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDTO } from 'src/user/dto/createUser.dto';

@Injectable()
export class MailService {

    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation(user: CreateUserDTO, emailToken: string) 
    {
      const url = `http://localhost:${process.env.PORT}/api/auth/confirm?token=${emailToken}`;
  
      await this.mailerService.sendMail(
      {
        to: user.email,
        from: '"Служба поддержки" <support@example.com>', 
        subject: 'Добро пожаловать в Tweeter! Необходимо подтвердить свою почту.',
        text:`Здравйствуйте,${user.surname} ${user.firstname}.\n\n Для подтверждения почты перейдите по ссылке:\n ${url}`
      });
    }

    async sendUserSignIn(email:string,ip:string,userAgent:string) 
    {  
      await this.mailerService.sendMail(
      {
        to: email,
        from: '"Служба поддержки" <support@example.com>', 
        subject: 'Произведён вход в аккаунт',
        text:`Здравйствуйте. В ваш аккаунт был произведён вход:\n IP:${ip}\n Устройство:${userAgent}.\n Если это были не вы, т
        то немедленно измените пароль и удалите все сессии!`
        
      });
    }

}
