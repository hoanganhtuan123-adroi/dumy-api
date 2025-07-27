import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TokenEntity } from './token.entity';
import { CartEntity } from './cart.entity';
import { TodoEntity } from './todo.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => TokenEntity, (token) => token.user)
  token: TokenEntity;

  @OneToMany(()=>TodoEntity, todo => todo.user )
  todo: TodoEntity

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'int' })
  age: number;

  @Column()
  gender: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: Date;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'float' })
  weight: number;

  @Column({ name: 'eye_color' })
  eyeColor: string;

  @Column({ name: 'hair_color' })
  hairColor: string;

  @Column({ name: 'hair_type' })
  hairType: string;

  @Column({ name: 'address_address' })
  address_address: string;

  @Column({ name: 'address_city' })
  address_city: string;

  @Column({ name: 'address_state' })
  address_state: string;

  @Column({ name: 'address_state_code' })
  address_stateCode: string;

  @Column({ type: 'float', name: 'address_lat' })
  address_lat: number;

  @Column({ type: 'float', name: 'address_lng' })
  address_lng: number;

  @Column({ name: 'address_country' })
  address_country: string;

  @Column()
  role: string;

  @OneToOne(()=> CartEntity, (cart) => cart.user)
  cart: CartEntity;
}
