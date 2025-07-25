import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../models/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from '../../common/passport/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { JwtRefreshStrategy } from '../../common/passport/jwt-refresh.strategy';
import { TokenEntity } from '../../models/token.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    TypeOrmModule.forFeature([UserEntity, TokenEntity]),
    JwtModule.registerAsync({
      useFactory: () => ({}),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
