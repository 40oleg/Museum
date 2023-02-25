import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Interval {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    timestamp: number;
}
