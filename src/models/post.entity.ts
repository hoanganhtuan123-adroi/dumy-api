import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({ name: 'reactions_likes' })
  reactionsLikes: number;

  @Column({ name: 'reactions_dislikes', type: 'text' })
  reactionsDislikes: number;

  @Column({ name: 'view' })
  view: number;

  @Column({name: "tags"})
  tags: string;

  @JoinColumn({name:"user_id"})
  @ManyToOne(()=>UserEntity, user=>user.post, {cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  user: UserEntity;
}
