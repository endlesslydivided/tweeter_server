import { BadRequestException, ForbiddenException, forwardRef, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthDto } from "./dto/Auth.dto";
import * as bcrypt from 'bcrypt';
import { MailService } from "../mail/mail.service";
import { InjectModel } from "@nestjs/sequelize";
import { UserService } from "../user/user.service";
import { CreateUserDto } from "../user/dto/createUser.dto";
import { AuthRepository } from "./auth.repository";

@Injectable()
export class AuthService {

    constructor(@Inject(forwardRef(() => UserService)) private userService: UserService,
                @Inject(forwardRef(() => JwtService)) private jwtService: JwtService,
                @Inject(forwardRef(() => MailService)) private mailService: MailService,
                private authRepository:AuthRepository
                ) {
    }

    async login(authDto: AuthDto) 
    {
        const user = await this.validateUser(authDto);
        const tokens = await this.getTokens(user);

        return {user,...tokens};
    }

    async logout(userId: number) 
    {
        //
    }


    async confirmEmail(emailToken: string) 
    {
        //
        // const storedToken = await this.authRepository.getEmailToken();
       
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) 
        {
            throw new BadRequestException("Пользователь с такими данными уже существует");
        }
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(userDto.password, salt);       
        const user = await this.userService.createUser({ ...userDto,password,salt});

        const emailToken = crypto.randomUUID();
        await this.authRepository.createEmailToken({email:userDto.email,emailToken});
        await this.mailService.sendUserConfirmation(user,emailToken);    
    }

    // async refreshTokens(user) 
    // {
    //     const userFromDb = await this.userService.getUserByEmail(user.email);

    //     if (!userFromDb) 
    //     {
    //         throw new BadRequestException("Пользователь с такими данными не существует");
    //     }

    //     const tokens = await this.getTokens(userFromDb);

    //     await this.updateRefreshToken(userFromDb, tokens.refreshToken);
    //     return tokens;
    // }

  
    // async updateRefreshToken(user, refreshToken: string) 
    // {
    //     const hashedRefreshToken = await bcrypt.hash(refreshToken,user.salt);
    //     await this.userService.updateRefreshTokenById(user.id,hashedRefreshToken);
    // }

    async getTokens(user) {
        const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
            {
                id: user.id,
                email: user.email,
            },
            {
                algorithm:'RS256',
                privateKey:process.env.ACCESS_TOKEN_PRIVATE,
                expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
            },
        ),
        this.jwtService.signAsync(
            {
                id: user.id,
                email: user.email,
            },
            {
                algorithm:'RS256',
                privateKey: process.env.REFRESH_TOKEN_PRIVATE,
                expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
            },
        ),
        ]);
        return {accessToken,refreshToken};
    }

  

  private async validateUser(authDto: AuthDto) {
    const user = await this.userService.getUserByEmail(authDto.email);
    if(user)
    {
      const passwordHash = await bcrypt.hash(authDto.password, user.salt);

      const passwordEquals = (user.password === passwordHash);
  
      if (passwordEquals) 
      {
        return user;
      }
    }
 
    throw new UnauthorizedException({ message: "Неккоректные email или пароль" });
  }
}
