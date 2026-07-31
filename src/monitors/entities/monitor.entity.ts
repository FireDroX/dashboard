import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MonitorStatus } from './monitor-status.enum';

@Entity('monitors')
export class Monitor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 2048,
    unique: true,
  })
  url: string;

  @Column({
    type: 'enum',
    enum: MonitorStatus,
    default: MonitorStatus.UNKNOWN,
  })
  status: MonitorStatus;

  @Column({
    type: 'int',
    nullable: true,
  })
  responseTime: number | null;

  @Column({
    type: 'smallint',
    nullable: true,
  })
  statusCode: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lastError: string | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  lastCheckedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
