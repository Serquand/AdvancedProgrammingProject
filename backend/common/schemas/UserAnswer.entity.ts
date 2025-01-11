import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { FormField } from "./FormField.entity";

@Entity()
export class FormFieldUserAnswer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('json', { nullable: true })
    value: string | number | boolean | (string | number | boolean)[];

    @Column("text", { nullable: true })
    valueText: string;

    @ManyToOne(() => FormField, (field) => field.answers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fieldId' })
    field: FormField;

    @Column()
    fieldId: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;
}