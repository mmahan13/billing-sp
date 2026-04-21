import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { TaxModule } from './tax/tax.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.BD_HOST,
      port: process.env.BD_PORT ? parseInt(process.env.BD_PORT) : 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, //carga las entidades en la bd que se crean
      synchronize: true, //Solo en dev en pro no se usa.
    }),
    UsersModule,
    ClientsModule,
    ProductsModule,
    OrdersModule,
    InvoicesModule,
    TaxModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
