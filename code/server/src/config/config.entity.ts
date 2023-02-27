import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from 'typeorm';
import {Interval} from "./interval.entity.js";
import {IConfiguration} from "../interfaces/configuration.interface.js";

@Entity()
export class Configuration implements IConfiguration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    enabledCarousel: boolean;

    @ManyToOne(() => Interval, interval => interval.id, {
        cascade: true,
    })
    changeInterval: Interval;
}
