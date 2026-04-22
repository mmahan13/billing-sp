import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Tax } from '../taxes/entities/tax.entity'; // Asegúrate de que la ruta coincida
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    // Inyectamos el repositorio de Tax para comprobar que el ID es real
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { taxId, ...productDetails } = createProductDto;

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

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.productRepository.softDelete(id);
  }
}
