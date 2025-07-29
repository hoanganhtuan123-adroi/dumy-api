import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { ConfigModule } from '@nestjs/config';
import { TokenEntity } from './models/token.entity';
import { ImageEntity } from './models/image.entity';
import { ProductModule } from './modules/product/product.module';
import { ProductEntity } from './models/product.entity';
import { ReviewEntity } from './models/review.entity';
import { CategoryEntity } from './models/category.entity';
import { ReviewModule } from './modules/review/review.module';
import { CartEntity } from './models/cart.entity';
import { CartItemEntity } from './models/cart-item.entity';
import { CartModule } from './modules/cart/cart.module';
import { TodoModule } from './modules/todo/todo.module';
import * as dotenv from 'dotenv';
import { TodoEntity } from './models/todo.entity';
import { RecipeEntity } from './models/recipe.entity';
import { RecipeModule } from './modules/recipe/recipe.module';
import { CategoryModule } from './modules/category/category.module';
dotenv.config();
@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        UserEntity,
        TokenEntity,
        ImageEntity,
        CategoryEntity,
        ProductEntity,
        ReviewEntity,
        CartEntity,
        CartItemEntity,
        TodoEntity,
        RecipeEntity
      ],
      synchronize: false,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ProductModule,
    ReviewModule,
    CartModule,
    TodoModule,
    RecipeModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
