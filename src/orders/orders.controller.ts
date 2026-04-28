import {
  Controller,
  Post,
  Body,
  Get,
  ParseUUIDPipe,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor) //activa los excludes en product entity y client entity
@Auth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Auth() // Protege la ruta (se necesita Token JWT)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User, // Extrae al usuario automáticamente del token
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.ordersService.findOne(id, user);
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.ordersService.findAll(user);
  }

  @Patch(':id/status')
  @Auth()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, user);
  }
}
