import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from '../../models/recipe.entity';
import { UserModule } from '../user/user.module';
import { MinioService } from '../minio/minio.service';
import { ImageModule } from '../image/image.module';
@Module({
  imports: [TypeOrmModule.forFeature([RecipeEntity]), UserModule, ImageModule, ImageModule],
  controllers: [RecipeController],
  providers: [RecipeService, MinioService],
})
export class RecipeModule {}
