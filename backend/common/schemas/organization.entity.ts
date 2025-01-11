import { Entity, PrimaryGeneratedColumn, Column, OneToMany  } from 'typeorm';
import { OrganizationUser } from './OrganizationUser.entity';
import { Form } from './Form.entity';

@Entity()
export class Organization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => OrganizationUser, (orgUser) => orgUser.organization)
    users: OrganizationUser[];

    @OneToMany(() => Form, (form) => form.organization)
    forms: Form[];
}