import { Tax } from 'src/taxes/entities/tax.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'product_name', nullable: false, unique: true })
  productName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column('text', { nullable: true })
  description: string;

  // Relacionamos con la tabla Taxes
  @ManyToOne(() => Tax, (tax) => tax.products, { eager: true })
  @JoinColumn({ name: 'taxId' })
  tax: Tax;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
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
  upperCaseName() {
    if (this.productName) {
      this.productName = this.productName.toUpperCase();
    }
  }
}
