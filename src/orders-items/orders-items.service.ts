import { Injectable } from '@nestjs/common';
import { CreateOrdersItemDto } from './dto/create-orders-item.dto';
import { UpdateOrdersItemDto } from './dto/update-orders-item.dto';

@Injectable()
export class OrdersItemsService {
  create(createOrdersItemDto: CreateOrdersItemDto) {
    return 'This action adds a new ordersItem';
  }

  findAll() {
    return `This action returns all ordersItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ordersItem`;
  }

  update(id: number, updateOrdersItemDto: UpdateOrdersItemDto) {
    return `This action updates a #${id} ordersItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordersItem`;
  }
}
