import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column()
    userId: number;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date;

    @Column({ default: false })
    isRevoked: boolean;
}