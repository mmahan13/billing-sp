import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { ColumnNumericTransformer } from '../../common/utils/numeric-transformer'; // Ajusta la ruta si la tienes
import { Order } from 'src/orders/entities/order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  quantity: number;

  // --- SNAPSHOTS (Congelamos el precio y el IVA de este momento exacto) ---
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  priceAtTime: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  taxAtTime: number;

  // --- RELACIONES ---
  // Si se borra la orden, se borran sus líneas en cascada (onDelete: 'CASCADE')
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
