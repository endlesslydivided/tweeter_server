import { forwardRef, Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { AccessTokenStrategy } from "./strategy/accessToken.strategy";
import { RefreshTokenStrategy } from "./strategy/refreshToken.strategy";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy
  ],
  imports:[

    {...JwtModule.register({}),global:true}
  ],
  exports:[
    AuthService
  ]
})
export class AuthModule {
}
