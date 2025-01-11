import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Form } from "./Form.entity";

@Entity()
export class SurveyPersonnalReviewGranted {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.id, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: "userId" })
    users: User;

    @Column({ nullable: false })
    surveyId: number;

    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => Form, form => form.id, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: "surveyId" })
    survey: Form;
}