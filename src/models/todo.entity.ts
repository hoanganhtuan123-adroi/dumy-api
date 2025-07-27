import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("todos")
export class TodoEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'name'})
    name: string

    @Column({name: 'completed', type: 'boolean'})
    completed: boolean

    @JoinColumn({name: "user_id"})
    @ManyToOne(()=>UserEntity, user=> user.id, {cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    user: UserEntity
}