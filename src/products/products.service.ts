import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Tax } from '../taxes/entities/tax.entity'; // Asegúrate de que la ruta coincida
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly looger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    // Inyectamos el repositorio de Tax para comprobar que el ID es real
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { taxId, productName, ...productDetails } = createProductDto;

    // 1. Comprobamos si el nompre del producto ya existe para evitar duplicados
    const existingProduct = await this.productRepository.findOneBy({
      productName,
    });
    if (existingProduct) {
      throw new ConflictException(
        `El producto con el nombre "${productName}" ya existe.`,
      );
    }

    //Verificamos que el impuesto existe
    const tax = await this.taxRepository.findOneBy({ id: taxId });
    if (!tax) {
      throw new NotFoundException(
        `El impuesto con ID ${taxId} no existe en la base de datos`,
      );
    }

    // 2. Creamos el producto enlazando la relación
    const product = this.productRepository.create({
      ...productDetails,
      productName,
      tax: tax, // Asociamos la entidad del impuesto
    });

    // 3. Guardamos en PostgreSQL
    return await this.productRepository.save(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { taxId, ...baseData } = updateProductDto;
    const product = await this.findOne(id);

    this.productRepository.merge(product, baseData);

    if (taxId) {
      const tax = await this.taxRepository.findOneBy({ id: taxId });
      if (!tax) {
        throw new NotFoundException(
          `El impuesto con ID ${taxId} no existe en la base de datos`,
        );
      }
      product.tax = tax;
    }

    return await this.productRepository.save(product);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`El producto con ID ${id} no existe`);
    }
    return product;
  }

  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;
    return await this.productRepository.find({
      skip,
      take: limit,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.productRepository.softDelete(id);
  }

  private handlerDBExceptions(error: any): never {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === '23505') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.detail);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === '23503') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.detail);
    }
    this.looger.error(error);
    throw new NotFoundException('Unexpected error, check server logs');
  }
}
