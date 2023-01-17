import { Body, Controller, Delete, forwardRef, Get, HttpStatus, Inject, Param, Post, Query, Req, Res, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
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
import { Session } from "./dto/auth-types";
import { AuthDTO } from "./dto/Auth.dto";
import { RefreshTokensDTO } from "./dto/refreshTokens.dto";
import { AuthJWTGuard } from "./guards/auth.guard";


@ApiTags("Authorization")
@Controller("auth")
export class AuthController {

    constructor(@Inject(forwardRef(() => UserService)) private userService: UserService,
    private authService: AuthService) {
    }

    @ApiOperation({ summary: "Refresh access and refresh tokens" })
    @ApiOkResponse({ schema: {type:'object',properties:{'accessToken':{type: 'string'},'refreshToken':{type: 'string'}}}})
    @ApiBody({ type: RefreshTokensDTO })
    @Post('/refreshTokens')
    async refreshTokens(@RefreshTokenArg() refresSessionId: string, @Body() refreshTokensDTO: RefreshTokensDTO,@Res() response: Response): Promise<void> 
    {
        const body = await this.authService.refreshTokens(refresSessionId,refreshTokensDTO.fingerprint);

        response.cookie("accessToken",body.accessToken,
        {maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE),httpOnly:true, secure:true, sameSite:"lax"});

        response.cookie("refreshToken",body.refreshToken,
        {maxAge: Number(process.env.REFRESH_TOKEN_EXPIRE),httpOnly:true, secure:true, sameSite:"lax"});

        response.json(body);
    }

    @ApiOperation({ summary: "SignUp a user" })
    @ApiBody({ type: CreateUserDTO })
    @Post('/signUp')
    signUp(@Body() createUserDTO: CreateUserDTO): Promise<void> 
    {
        return this.authService.signUp(createUserDTO);
    }

    @ApiOperation({ summary: "Delete all user sessions" })
    @UseGuards(AuthJWTGuard)
    @Delete('/sessions')
    removeSessions(@CurrentUserArgs() currentUser: CurrentUserArgs): Promise<void> 
    {
        return this.authService.deleteAllSessions(currentUser);
    }

    @ApiOperation({ summary: "Delete a user session" })
    @UseGuards(AuthJWTGuard)
    @Delete('/sessions/:id')
    removeSession(@Param('id') id:string,@CurrentUserArgs() currentUser: CurrentUserArgs): Promise<void> 
    {
        return this.authService.deleteSession(id,currentUser);
    }

    @ApiOperation({ summary: "Get all user sessions" })
    @UseGuards(AuthJWTGuard)
    @Get('/sessions')
    getUserSessions(@CurrentUserArgs() currentUser: CurrentUserArgs): Promise<Session[]| undefined[]> 
    {
        return this.authService.getAllSessions(currentUser);
    }  

    @ApiOperation({ summary: "SignIn a user" })
    @ApiOkResponse({ schema: {type:'object',properties:{'accessToken':{type: 'string'},'refreshToken':{type: 'string'}}}})
    @ApiBody({ type: AuthDTO })    
    @Post('/signIn')
    async signIn(@PrivacyInfoArgs() privacyInfo:PrivacyInfoArgs, @Body() authDTO: AuthDTO,@Res() response: Response): Promise<void> 
    {
        const body = await this.authService.signIn(privacyInfo,authDTO);

        response.cookie("accessToken",body.accessToken,
        {maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE),httpOnly:true, secure:true, sameSite:"lax"});

        response.cookie("refreshToken",body.refreshToken,
        {maxAge: Number(process.env.REFRESH_TOKEN_EXPIRE),httpOnly:true, secure:true, sameSite:"lax"});

        response.json(body);

    }

    @ApiOperation({ summary: "SignOut a user" })
    @Post('/signOut')
    async signOut(@RefreshTokenArg() refreshSession: string,@Res() response: Response): Promise<void> 
    {
        await this.authService.signOut(refreshSession);
        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");
        response.end();
    }

    @ApiOperation({ summary: "Confirm user email" })
    @Get('/confirm')
    confirmEmail(@Query('token') token:string,@Res() res: Response): void 
    {
        if(!this.authService.confirmEmail(token))
        {
            res.location(process.env.REACT_SERVER_URI).sendStatus(HttpStatus.TEMPORARY_REDIRECT);
        }
        res.location(`${process.env.REACT_SERVER_URI}/login/success`).sendStatus(HttpStatus.TEMPORARY_REDIRECT); 
    }

    @ApiOperation({ summary: "Get current user data" })
    @ApiCreatedResponse({ type: User })
    @UseGuards(AuthJWTGuard)
    @Get("/me")
    getMe(@CurrentUserArgs() currentUser: CurrentUserArgs) 
    {
        return this.userService.getUserById(currentUser.userId);
    }
}
