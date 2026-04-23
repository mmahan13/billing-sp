import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxesModule } from './taxes/taxes.module';
import { AuxiliaryModule } from './auxiliary/auxiliary.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, //carga las entidades en la bd que se crean
      synchronize: true, //Solo en dev en pro no se usa.
    }),
    ClientsModule,
    ProductsModule,
    OrdersModule,
    InvoicesModule,
    TaxesModule,
    AuxiliaryModule,
    CommonModule,
    AuthModule,
    CompanyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
