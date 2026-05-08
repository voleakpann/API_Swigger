import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ScanType = 'IN' | 'OUT';

@Entity({ name: 'scans' })
export class Scan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', length: 8 })
  type!: ScanType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
