import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity({ name: 'categories' })
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];

  @Column({ type: 'nvarchar', length: 255 })
  slug: string;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  url: string;
}
