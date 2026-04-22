import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  name: string;

  @IsNumber()
  @IsPositive({ message: 'El precio base debe ser un número positivo' })
  @IsNotEmpty({ message: 'El precio base es obligatorio' })
  basePrice: number;

  @IsString()
  @IsOptional()
  description?: string;

  // Pedimos explícitamente el ID del impuesto (debe ser un UUID válido)
  @IsUUID('4', { message: 'El ID del impuesto no tiene un formato válido' })
  @IsNotEmpty({ message: 'Debes seleccionar un tipo de impuesto' })
  taxId: string;
}
