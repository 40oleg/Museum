import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {IInterval} from "../interfaces/configuration.interface.js";

@Entity()
export class Interval implements IInterval {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    timestamp: number;
    constructor() {
        this.name = 'empty';
        this.timestamp = 10000;
    }
}
