import "reflect-metadata"
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { ConfigModule } from '@nestjs/config';
import { TokenEntity } from "./models/token.entity";
import { ImageEntity } from "./models/image.entity";
import { ProductModule } from './modules/product/product.module';
import { ProductEntity } from "./models/product.entity";
import { ReviewEntity } from "./models/review.entity";
import { CategoryEntity } from "./models/category.entity";
import { ReviewModule } from './modules/review/review.module';
import { CartEntity } from "./models/cart.entity";
import { CartItemEntity } from "./models/cart-item.entity";
import { CartModule } from './modules/cart/cart.module';
@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'nestjs_onsite',
      entities: [UserEntity, TokenEntity, ImageEntity,CategoryEntity, ProductEntity, ReviewEntity, CartEntity, CartItemEntity],
      synchronize: false,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ProductModule,
    ReviewModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
