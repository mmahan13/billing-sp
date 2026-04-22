import { Module } from '@nestjs/common';
import { AuxiliaryService } from './auxiliary.service';
import { AuxiliaryController } from './auxiliary.controller';
import { Auxiliary } from './entities/auxiliary.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AuxiliaryController],
  providers: [AuxiliaryService],
  imports: [TypeOrmModule.forFeature([Auxiliary])],
})
export class AuxiliaryModule {}
