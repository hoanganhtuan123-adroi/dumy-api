import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('recipes')
export class RecipeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity, user => user.recipe, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: UserEntity;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'ingredients', type: 'text' })
  ingredients: string;

  @Column({ name: 'instructions', type: 'text' })
  instructions: string;

  @Column({ name: 'prepTimeMinutes' })
  prepTimeMinutes: number;

  @Column({ name: 'cookTimeMinutes' })
  cookTimeMinutes: number;

  @Column({ name: 'serving' })
  serving: number;

  @Column({ name: 'difficult' })
  difficult: string;

  @Column({ name: 'cuisine' })
  cuisine: string;

  @Column({ name: 'caloriesPerServing' })
  caloriesPerServing: number;

  @Column({ name: 'tags', type: 'text' })
  tags: string;

  @Column({ name: 'rating', type: 'decimal' })
  rating: number;

  @Column({ name: 'reviewCount' })
  reviewCount: number;

  @Column({ name: 'mealType', type: 'text' })
  mealType: string;
}
