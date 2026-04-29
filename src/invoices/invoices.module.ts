import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicePdfService } from './invoice-pdf.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfService],
  imports: [TypeOrmModule.forFeature([Invoice])],
  exports: [InvoicesService],
})
export class InvoicesModule {}
