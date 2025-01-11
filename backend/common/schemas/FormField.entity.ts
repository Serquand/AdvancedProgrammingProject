import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Form } from './Form.entity';
import { FormFieldUserAnswer } from './UserAnswer.entity';
import { FormFieldSelectChoices } from './FormFieldSelectChoices.entity';

export enum FieldType {
    "NUMBER" = "NB",
    "SELECT" = "SL",
    "TEXTAREA" = "TA",
    "TEXT" = "TX",
    "CHECKBOX" = "CB"
}

@Entity()
export class FormField {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;

    @Column({
        type: "enum",
        enum: FieldType,
        default: FieldType.TEXT
    })
    fieldType: FieldType;

    @ManyToOne(() => Form, (form) => form.fields, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'formId' })
    form: Form;

    @Column({ default: true })
    required: boolean;

    @Column({ default: 0 })
    minValue: number;

    @Column({ default: 20 })
    maxValue: number;

    @Column()
    order: number;

    @Column({ default: 1 })
    maximalNumberOfChoices?: number;

    @Column()
    formId: number;

    @OneToMany(() => FormFieldUserAnswer, (answer) => answer.field, { cascade: true })
    answers: FormFieldUserAnswer[];

    @OneToMany(() => FormFieldSelectChoices, (choice) => choice.formField, { cascade: true })
    choices: FormFieldSelectChoices[];
}