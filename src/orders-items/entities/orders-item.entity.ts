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

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  priceAtTime: number;

  // --- EL CAMBIO ESTÁ AQUÍ ---
  // Guardamos el % de IVA que se aplicó en ese momento
  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
    name: 'iva_at_time', // Nombre claro en BD
  })
  ivaAtTime: number;

  // Guardamos el % de Recargo de Equivalencia (si el cliente lo tenía)
  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
    name: 'surcharge_at_time',
  })
  surchargeAtTime: number;

  // ... resto de relaciones igual
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
