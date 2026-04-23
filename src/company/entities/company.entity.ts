import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false })
  businessName: string; // Nombre del apicultor o de su empresa

  @Column('varchar', { length: 20, unique: true })
  taxId: string; // NIF / CIF

  @Column('text')
  address: string; // Dirección fiscal completa

  @Column('varchar', { length: 50, nullable: true })
  bankAccount: string; // IBAN

  @Column('varchar', { length: 20, nullable: true })
  phone: string;

  // --- Relación con el Usuario ---
  // Unimos el perfil de empresa con el usuario que lo gestiona
  @OneToOne(() => User)
  @JoinColumn({ name: 'owner_id' }) // Esto crea la columna owner_id en la tabla companies
  owner: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
