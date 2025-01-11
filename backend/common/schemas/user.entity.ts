import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRoles {
    ADMIN = 'admin',
    STUDENT = 'student',
    TEACHER = 'teacher',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, type: 'varchar', nullable: false, length: 100 })
    email: string;

    @Column({ nullable: false, type: 'enum', enum: UserRoles, default: "student" })
    role: UserRoles;

    @Column({ type: 'varchar', length: 100, nullable: false })
    firstName: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    lastName: string;

    @Column({ type: 'varchar', nullable: false, select: false })
    password: string;
}