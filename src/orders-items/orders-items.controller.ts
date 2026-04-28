import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersItemsService } from './orders-items.service';
import { CreateOrdersItemDto } from './dto/create-orders-item.dto';
import { UpdateOrdersItemDto } from './dto/update-orders-item.dto';

@Controller('orders-items')
export class OrdersItemsController {
  constructor(private readonly ordersItemsService: OrdersItemsService) {}

  @Post()
  create(@Body() createOrdersItemDto: CreateOrdersItemDto) {
    return this.ordersItemsService.create(createOrdersItemDto);
  }

  @Get()
  findAll() {
    return this.ordersItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrdersItemDto: UpdateOrdersItemDto) {
    return this.ordersItemsService.update(+id, updateOrdersItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersItemsService.remove(+id);
  }
}
