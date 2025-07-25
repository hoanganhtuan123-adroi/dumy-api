import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'tokens' })
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_token_user' })
  @OneToOne(() => UserEntity, (user) => user.token)
  user: UserEntity;

  @Column({ name: 'refreshToken' })
  refreshToken: string;
}
