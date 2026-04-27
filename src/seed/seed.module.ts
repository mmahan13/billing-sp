import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { Company } from 'src/company/entities/company.entity';
import { User } from 'src/auth/entities/user.entity';
import { Tax } from 'src/taxes/entities/tax.entity';
import { Product } from 'src/products/entities/product.entity';
import { Client } from 'src/clients/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Tax, Product, Client])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
