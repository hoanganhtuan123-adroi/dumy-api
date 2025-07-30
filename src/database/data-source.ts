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
import * as dotenv from 'dotenv';
import { TodoEntity } from '../models/todo.entity';
import { RecipeEntity } from '../models/recipe.entity';
import { PostEntity } from '../models/post.entity';
dotenv.config();
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
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
    RecipeEntity,
    PostEntity
  ],
  migrations: ['./src/migrations/*.ts'], // đường dẫn tới migrations
  synchronize: false,
});
