import { Module } from '@nestjs/common';
import { OrdersItemsService } from './orders-items.service';
import { OrdersItemsController } from './orders-items.controller';

@Module({
  controllers: [OrdersItemsController],
  providers: [OrdersItemsService],
})
export class OrdersItemsModule {}
