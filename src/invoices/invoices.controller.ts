import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import * as express from 'express';
import { InvoicesService } from './invoices.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { InvoicePdfService } from './invoice-pdf.service';

@Controller('invoices')
@UseInterceptors(ClassSerializerInterceptor) //activa los excludes en product entity y client entity
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly invoicePdfService: InvoicePdfService,
  ) {}

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.invoicesService.findAll(user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.invoicesService.findOne(id, user);
  }

  @Get(':id/pdf')
  @Auth()
  async getPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Res() res: express.Response,
  ) {
    try {
      const invoice = await this.invoicesService.findOne(id, user);

      const buffer = await this.invoicePdfService.generatePdf(invoice);

      // Una vez tenemos el buffer listo, preparamos las cabeceras
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        'Content-Length': buffer.length,
      });

      // Y finalmente lo enviamos
      res.end(buffer);
    } catch (error) {
      console.error('PDF Error:', error);
      throw new InternalServerErrorException(
        'No se pudo generar el PDF de la factura',
      );
    }
  }

  @Get('reports/taxes/sales/:year')
  @Auth() // Protegido con JWT
  async getSalesTaxReport(
    @Param('year', ParseIntPipe) year: number,
    @GetUser() user: User,
  ) {
    try {
      const report = await this.invoicesService.getSalesTaxReport(year, user);
      return {
        message: `Informe de impuestos de ventas para el año ${year}`,
        year: year,
        data: report,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new InternalServerErrorException(
        'Error al generar el informe de impuestos',
      );
    }
  }

  @Get('reports/traceability/data/:year')
  @Auth()
  async getTraceabilityData(
    @Param('year', ParseIntPipe) year: number,
    @GetUser() user: User,
  ) {
    try {
      const data = await this.invoicesService.getTraceabilityData(year, user);
      return {
        year,
        totalRows: data.length,
        data: data,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new InternalServerErrorException(
        'Error al obtener datos de trazabilidad',
      );
    }
  }
}
