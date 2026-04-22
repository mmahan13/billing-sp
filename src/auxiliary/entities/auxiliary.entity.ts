import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auxiliaries')
export class Auxiliary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // Ej: 'PAYMENT_METHOD', 'ORDER_STATUS'

  @Column()
  name: string; // Ej: 'Transferencia', 'Efectivo', 'Tarjeta'

  @Column({ nullable: true })
  description: string;
}
