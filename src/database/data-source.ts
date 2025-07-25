// data-source.ts
import { DataSource } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { TokenEntity } from '../models/token.entity';
import { ImageEntity } from '../models/image.entity';
import { ReviewEntity } from '../models/review.entity';
import { ProductEntity } from '../models/product.entity';
import { CategoryEntity } from '../models/category.entity';
import { CartEntity } from '../models/cart.entity';
import { CartItemEntity } from '../models/cart-item.entity';
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'nestjs_onsite',
  entities: [UserEntity, TokenEntity, ImageEntity,CategoryEntity, ProductEntity, ReviewEntity, CartEntity, CartItemEntity],
  migrations: ['./src/migrations/*.ts'], // đường dẫn tới migrations
  synchronize: false,
});
