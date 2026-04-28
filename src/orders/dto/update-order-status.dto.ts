import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `El estado debe ser uno de los siguientes: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}
