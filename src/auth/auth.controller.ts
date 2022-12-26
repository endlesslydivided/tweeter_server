import { Body, Controller, forwardRef, Get, HttpStatus, Inject, Param, Post, Query, Req, Res, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Transaction } from "sequelize";
import { TransactionInterceptor } from "src/transactions/transaction.interceptor";
import { TransactionParam } from "src/transactions/transactionParam.decorator";
import { CreateUserDto } from "src/user/dto/createUser.dto";
import { User } from "src/user/user.model";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/Auth.dto";


@ApiTags("Authorization")
@Controller("auth")
export class AuthController {

    constructor(@Inject(forwardRef(() => UserService)) private userService: UserService,
    private authService: AuthService) {
    }

    @Post('/registration')
    registration(@Body() createUserDto: CreateUserDto) 
    {
    return this.authService.registration(createUserDto);
    }

    @Get('/confirm')
    @UseInterceptors(TransactionInterceptor)
    confirmEmail(@Query('token') token:string,@Res() res: Response,@TransactionParam() transaction: Transaction) 
    {
        if(!this.authService.confirmEmail(token,transaction))
        {
            res.location(process.env.REACT_SERVER_ADRESS).sendStatus(HttpStatus.TEMPORARY_REDIRECT);
        }
        res.location(`${process.env.REACT_SERVER_ADRESS}/login/success`).sendStatus(HttpStatus.TEMPORARY_REDIRECT); 
    }
}
