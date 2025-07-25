import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";

@Entity({ name: 'reviews' })
export class ReviewEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'decimal', precision: 2, scale: 1})
    rating: number;

    @Column({ type: 'text' })
    comment: string;

    @Column({type: 'date'})
    date: Date;

    @Column({type: 'nvarchar', length: 255})
    reviewer_name: string;

    @Column({type: 'nvarchar', length: 255})
    reviewer_email: string;

    @JoinColumn({name: 'product_id'})
    @ManyToOne(() => ProductEntity, product => product.id, {cascade: true, onUpdate: 'CASCADE', onDelete: 'CASCADE'})
    product: ProductEntity
}