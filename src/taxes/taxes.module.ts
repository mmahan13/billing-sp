import { Module } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { TaxesController } from './taxes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tax } from './entities/tax.entity';

@Module({
  controllers: [TaxesController],
  providers: [TaxesService],
  imports: [TypeOrmModule.forFeature([Tax])],
})
export class TaxesModule {}
