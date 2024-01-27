import { Entity, CreateDateColumn, Column, UpdateDateColumn, Index } from 'typeorm';
import { NANO_KEY_LENGTH } from 'src/constants/orm.constants.js';

@Entity()
export class User {
    @Column({
        length: NANO_KEY_LENGTH,
        nullable: false,
        primary: true,
    })
    public id: string;

    @Column({
        nullable: false,
        unique: true,
    })
    public email: string;

    @Column({
        nullable: false,
    })
    @Index({ fulltext: true })
    public name: string;

    @Column({
        nullable: false,
    })
    public passwordHash: string;

    @Index()
    @Column({
        default: true,
        nullable: false,
        type: 'boolean',
    })
    public isActive: boolean;

    @UpdateDateColumn()
    public updatedAt: Date;

    @CreateDateColumn()
    public createdAt: Date;
}
