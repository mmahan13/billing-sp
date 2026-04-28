import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Company } from 'src/company/entities/company.entity';
import { Product } from 'src/products/entities/product.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Order } from 'src/orders/entities/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false })
  fullName: string;

  @Column('text', { unique: true, nullable: false })
  email: string;

  @Column('text', { select: false, nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.USER],
  })
  roles: UserRole[];

  @Column('boolean', { default: true })
  isActive: boolean;

  //relaciones
  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Client, (client) => client.user)
  clients: Client[];

  @OneToOne(() => Company, (company) => company.owner)
  company: Company;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
