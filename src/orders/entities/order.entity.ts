import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { ColumnNumericTransformer } from '../../common/utils/numeric-transformer'; // Ajusta la ruta
import { OrderStatus } from '../enum/order-status.enum';
import { OrderItem } from 'src/orders-items/entities/orders-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // El total lo calcularemos sumando las líneas (base + iva)
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  // --- RELACIONES Y MULTI-TENANT ---
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User; // El "dueño" de la orden (apicultor)

  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Client; // El comprador

  // Una orden tiene muchas líneas. 'cascade: true' nos permite guardar
  // la orden y sus líneas de golpe con un solo .save()
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  // --- AUDITORÍA ---
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;
}
