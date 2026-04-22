import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3, {
    message: 'El nombre del producto debe tener al menos 3 caracteres',
  })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  productName: string;

  @IsNumber()
  @IsPositive({ message: 'El precio base debe ser un número positivo' })
  @IsNotEmpty({ message: 'El precio base es obligatorio' })
  basePrice: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Debes seleccionar un tipo de impuesto' })
  taxId: string;
}
