import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('recipes')
export class RecipeEntity {
    @PrimaryGeneratedColumn()
    id: number

    @JoinColumn({name: "user_id"})
    @ManyToOne(()=>UserEntity, ()=>{}, {cascade: true, onDelete:'CASCADE', onUpdate: 'CASCADE'})
    user: UserEntity;

    
}