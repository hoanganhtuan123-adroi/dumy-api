import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewEntity } from './review.entity';
import { CategoryEntity } from './category.entity';
import { CartItemEntity } from './cart-item.entity';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => ReviewEntity, (review) => review.product)
  reviews: ReviewEntity[];

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.products)
  cartItems: CartItemEntity[];

  @JoinColumn({ name: 'category_id' })
  @ManyToOne(() => CategoryEntity, (category) => category.products, {cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  category: CategoryEntity;

  @Column({ type: 'nvarchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'nvarchar', length: 200 })
  tags: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rating: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'nvarchar', length: 255 })
  brand: string;

  @Column({ type: 'nvarchar', length: 255 })
  sku: string;

  @Column({ type: 'int' })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dimensions_width: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dimensions_height: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dimensions_depth: number;

  @Column({ type: 'nvarchar', length: 255 })
  warranty_information: string;

  @Column({ type: 'nvarchar', length: 255 })
  shipping_information: string;

  @Column({ type: 'nvarchar', length: 255 })
  availability_status: string;

  @Column({ type: 'nvarchar', length: 255 })
  return_policy: string;

  @Column({ type: 'int' })
  minimumOrderQuantity: number;

  @Column({ type: 'nvarchar', length: 255 })
  meta_barcode: string;

  @Column({ type: 'nvarchar', length: 255 })
  meta_qrcode: string;
}