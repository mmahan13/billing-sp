import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from 'src/orders-items/entities/orders-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { Client } from 'src/clients/entities/client.entity';
import { AuthModule } from 'src/auth/auth.module';
import { InvoicesModule } from 'src/invoices/invoices.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    // 1. Añadimos todas las entidades que el OrdersService inyecta vía @InjectRepository
    TypeOrmModule.forFeature([Order, OrderItem, Product, Client]),
    // 2. Importamos AuthModule para que funcione la protección de rutas (@Auth)
    AuthModule,
    InvoicesModule,
  ],
})
export class OrdersModule {}
