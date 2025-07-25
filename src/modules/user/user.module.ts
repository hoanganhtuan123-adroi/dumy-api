import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../models/user.entity';
import { MinioService } from '../../common/bases/minio.service';
import { ImageEntity } from '../../models/image.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessAdminStrategy } from '../../common/passport/jwt-admin.strategy';
import { JwtAccessStrategy } from '../../common/passport/jwt.strategy';
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ImageEntity]), PassportModule],
  controllers: [UserController],
  providers: [UserService, MinioService, JwtAccessAdminStrategy, JwtAccessStrategy],
  exports: [UserService ]
})
export class UserModule {}
