import {
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsUUID()
  productId: string;
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  clientId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
