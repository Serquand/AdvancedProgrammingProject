import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FormField } from './FormField.entity';
import { Organization } from './organization.entity';

@Entity()
export class Form {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: "text" })
    description: string;

    @Column()
    isPublic: boolean;

    @OneToMany(() => FormField, (formField) => formField.form, { cascade: true })
    fields: FormField[];

    @ManyToOne(() => Organization, (organization) => organization.forms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column({ nullable: false })
    organizationId: number;
}