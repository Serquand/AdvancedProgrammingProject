import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FormField } from './FormField.entity';

@Entity()
export class FormFieldSelectChoices {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;

    @ManyToOne(() => FormField, (formField) => formField.choices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'formFieldId' })
    formField: FormField;

    @Column()
    formFieldId: number;
}