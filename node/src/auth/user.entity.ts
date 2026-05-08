import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 20, nullable: false, unique: true })
  phone!: string;

  @Column({ name: 'otp_code', type: 'varchar', length: 10, nullable: true })
  otpCode?: string | null;

  @Column({ name: 'otp_expired_at', type: 'timestamp', nullable: true })
  otpExpiredAt?: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  role?: string | null;
}
