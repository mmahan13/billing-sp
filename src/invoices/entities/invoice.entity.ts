import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../auth/entities/user.entity';
import { ColumnNumericTransformer } from '../../common/utils/numeric-transformer';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 20, unique: true })
  invoiceNumber: string; // Ejemplo: F-2026-001

  @Column('int')
  sequenceNumber: number; // El número puro (1, 2, 3...) para facilitar el siguiente

  @Column('int')
  year: number; // Para reiniciar la cuenta cada 1 de enero

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  issueDate: Date;

  // --- RELACIONES ---
  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
