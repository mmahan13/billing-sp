import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    UsersModule,
    ClientsModule,
    ProductsModule,
    OrdersModule,
    InvoicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
