import { forwardRef, Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { AccessTokenStrategy } from "./strategy/accessToken.strategy";
import { RefreshTokenStrategy } from "./strategy/refreshToken.strategy";
import { AuthRepository } from "./auth.repository";
import { redisModule } from "src/module.config";
import { UserModule } from "src/user/user.module";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuthRepository,
  ],
  imports:[
    {...JwtModule.register({}),global:true},redisModule, UserModule
  ],
  exports:[
    AuthService,
  ]
})
export class AuthModule {
}
