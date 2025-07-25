import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from '../../models/cart.entity';
import { CartItemEntity } from '../../models/cart-item.entity';
import { ProductEntity } from '../../models/product.entity';
import { MinioService } from '../../common/bases/minio.service';
import { ImageEntity } from '../../models/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity, ProductEntity, ImageEntity])], 
  controllers: [CartController],
  providers: [CartService, MinioService],
})
export class CartModule {}
