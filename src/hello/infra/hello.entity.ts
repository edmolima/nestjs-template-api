import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'hellos' })
export class HelloEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  name?: string;

  @Column()
  message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
