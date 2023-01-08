import { Body, Controller, Delete, forwardRef, Get, HttpStatus, Inject, Param, Post, Query, Req, Res, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Transaction } from "sequelize";
import { TransactionInterceptor } from "src/transactions/transaction.interceptor";
import { TransactionParam } from "src/transactions/transactionParam.decorator";
import { CreateUserDTO } from "src/user/dto/createUser.dto";
import { User } from "src/user/user.model";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { CurrentUserArgs } from "./decorators/currentUserArgs.decorator";
import { PrivacyInfoArgs } from "./decorators/privacyInfoArgs.decorator";
import { RefreshTokenArg } from "./decorators/refreshTokenArg.decorator";
import { AuthDTO } from "./dto/Auth.dto";
import { RefreshTokensDTO } from "./dto/refreshTokens.dto";


@ApiTags("Authorization")
@Controller("auth")
export class AuthController {

    constructor(@Inject(forwardRef(() => UserService)) private userService: UserService,
    private authService: AuthService) {
    }

    @Post('/refreshTokens')
    async refreshTokens(@RefreshTokenArg() refresSessionId: string, @Body() refreshTokensDTO: RefreshTokensDTO,@Res() response: Response) 
    {
        const body = await this.authService.refreshTokens(refresSessionId,refreshTokensDTO.fingerprint);

        response.cookie("accessToken",body.accessToken,
        {maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE),httpOnly:true, secure:true, sameSite:"lax"});

        response.cookie("refreshToken",body.refreshToken,
        {maxAge: Number(process.env.REFRESH_TOKEN_EXPIRE),httpOnly:true, secure:true, sameSite:"lax"});

        response.json(body);
    }

    @Post('/signUp')
    signUp(@Body() createUserDTO: CreateUserDTO) 
    {
        return this.authService.signUp(createUserDTO);
    }

    @Delete('/session')
    removeSessions(@CurrentUserArgs() currentUser: CurrentUserArgs) 
    {
        return this.authService.deleteAllSessions(currentUser);
    }

    @Delete('/session/:id')
    removeSession(@Param('id') id:string,@CurrentUserArgs() currentUser: CurrentUserArgs) 
    {
        return this.authService.deleteSession(id,currentUser);
    }

    @Get('/session')
    getUserSessions(@CurrentUserArgs() currentUser: CurrentUserArgs) 
    {
        return this.authService.getAllSessions(currentUser);
    }  

    @Post('/signIn')
    async signIn(@PrivacyInfoArgs() privacyInfo:PrivacyInfoArgs, @Body() authDTO: AuthDTO,@Res() response: Response) 
    {
        const body = await this.authService.signIn(privacyInfo,authDTO);

        response.cookie("accessToken",body.accessToken,
        {maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE),httpOnly:true, secure:true, sameSite:"lax"});

        response.cookie("refreshToken",body.refreshToken,
        {maxAge: Number(process.env.REFRESH_TOKEN_EXPIRE),httpOnly:true, secure:true, sameSite:"lax"});

        response.json(body);

    }

    @Post('/signOut')
    signOut(@RefreshTokenArg() refresSessionId: string,@Res() response: Response) 
    {
        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");
        return this.authService.signOut(refresSessionId);
    }

    @Get('/confirm')
    confirmEmail(@Query('token') token:string,@Res() res: Response) 
    {
        if(!this.authService.confirmEmail(token))
        {
            res.location(process.env.REACT_SERVER_ADRESS).sendStatus(HttpStatus.TEMPORARY_REDIRECT);
        }
        res.location(`${process.env.REACT_SERVER_ADRESS}/login/success`).sendStatus(HttpStatus.TEMPORARY_REDIRECT); 
    }
}
