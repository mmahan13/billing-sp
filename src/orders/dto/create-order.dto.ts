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

  // NUEVO CAMPO: Aceptamos el precio modificado desde el Front
  @IsNumber()
  @Min(0) // Usamos Min(0) en lugar de IsPositive por si Manuel quiere regalar un producto (precio 0€)
  price: number;
}

export class CreateOrderDto {
  @IsUUID()
  clientId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
