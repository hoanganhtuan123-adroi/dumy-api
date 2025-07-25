import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "images"})
export class ImageEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @Column()
    filename: string

    @Column()
    imageable_type: string
    
    @Column()
    imageable_id: number

}