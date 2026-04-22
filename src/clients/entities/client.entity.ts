import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  businessName: string; // Nombre completo o Razón Social

  @Column({ type: 'varchar', length: 9, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  taxId: string; // NIF, CIF o DNI

  @Column({ type: 'text', nullable: true })
  address: string; // Dirección fiscal (necesaria para la factura)

  @Column({ type: 'varchar', length: 50, nullable: true })
  email: string;

  // ¡Este campo es la magia para el Recargo de Equivalencia!
  @Column({ type: 'boolean', default: false })
  hasEquivalenceSurcharge: boolean;

  // Fechas de auditoría (siempre vienen bien)
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /* @Column({ type: 'uuid', name: 'created_by' })
    createdBy: string; */

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;

  //Soft Delete nativo de TypeORM
  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  upperCaseInfoClient() {
    if (this.businessName) {
      this.businessName = this.businessName.toUpperCase();
    }

    if (this.address) {
      this.address = this.address.toUpperCase();
    }
  }
}
