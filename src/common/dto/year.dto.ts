import { IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
export class YearDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  year?: number;
}
