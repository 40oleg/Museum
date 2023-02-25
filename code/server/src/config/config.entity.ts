import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from 'typeorm';
import {Interval} from "./interval.entity.js";

@Entity()
export class Configuration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    enabledCarousel: boolean;

    @ManyToOne(() => Interval, interval => interval.id, {
        cascade: true,
    })
    changeInterval: Interval;
}
