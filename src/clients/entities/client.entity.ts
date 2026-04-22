import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  businessName: string; // Nombre completo o Razón Social

  @Column({ type: 'varchar', length: 20, unique: true })
  taxId: string; // NIF, CIF o DNI

  @Column({ type: 'text', nullable: true })
  address: string; // Dirección fiscal (necesaria para la factura)

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  // ¡Este campo es la magia para el Recargo de Equivalencia!
  @Column({ type: 'boolean', default: false })
  hasEquivalenceSurcharge: boolean;

  // Fechas de auditoría (siempre vienen bien)
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
