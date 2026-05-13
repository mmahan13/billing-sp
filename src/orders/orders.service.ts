import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';
import { OrderItem } from 'src/orders-items/entities/orders-item.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './enum/order-status.enum';
import { InvoicesService } from 'src/invoices/invoices.service';
import { YearResult } from 'src/interfaces/year.model';
import { YearDto } from 'src/common/dto/year.dto';
import { calculateInvoiceSummary } from 'src/invoices/utilities/calculate-invoice-summary';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    // Inyectamos el DataSource para manejar transacciones manuales
    private readonly dataSource: DataSource,

    private readonly invoicesService: InvoicesService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    const { clientId, items } = createOrderDto;

    // 1. Validaciones previas (fuera de la transacción para no bloquear la DB)
    const client = await this.validateClient(clientId, user.id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItemsToInsert: OrderItem[] = [];
      const year = new Date().getFullYear();
      // 1. Buscamos el último número de pedido de este usuario en el año actual
      const lastOrder = await queryRunner.manager.findOne(Order, {
        where: {
          year: year,
          user: { id: user.id },
        },
        order: { orderNumber: 'DESC' }, // Traemos el más alto
      });

      // 2. Calculamos el siguiente número
      const nextNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

      // 3. Generamos la referencia formateada (Ej: PR-2026-001)
      // padStart añade ceros a la izquierda para que siempre tenga 3 dígitos
      const reference = `PR-${year}-${String(nextNumber).padStart(3, '0')}`;

      for (const item of items) {
        const product = await this.validateProduct(item.productId, user.id);

        // --- LE PASAMOS EL PRECIO CUSTOM DE MANUEL ---
        const lineDetails = this.calculateLineDetails(
          product,
          item.quantity,
          item.price, // <--- NUEVO: Pasamos el precio del DTO
          client.hasEquivalenceSurcharge,
        );

        const orderItem = queryRunner.manager.create(OrderItem, {
          quantity: item.quantity,
          priceAtTime: lineDetails.priceAtTime,
          ivaAtTime: lineDetails.ivaAtTime,
          surchargeAtTime: lineDetails.surchargeAtTime,
          product: product,
        });

        orderItemsToInsert.push(orderItem);
        totalAmount += lineDetails.totalLinea;
      }

      const order = queryRunner.manager.create(Order, {
        client,
        user,
        totalAmount: Number(totalAmount.toFixed(2)),
        items: orderItemsToInsert,
        year: year,
        orderNumber: nextNumber, // Guardamos el número (1, 2, 3...)
        reference: reference,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // Re-lanzamos para que Nest gestione la respuesta
    } finally {
      await queryRunner.release();
    }
  }

  // --- MÉTODOS PRIVADOS DE APOYO ---

  private async validateClient(clientId: string, userId: string) {
    const client = await this.clientRepository.findOne({
      where: { id: clientId, user: { id: userId } },
    });
    if (!client) throw new NotFoundException(`Cliente no encontrado`);
    return client;
  }

  private async validateProduct(productId: string, userId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId, user: { id: userId } },
      relations: ['tax'],
    });
    if (!product)
      throw new BadRequestException(`Producto ${productId} no válido`);
    return product;
  }

  private calculateLineDetails(
    product: Product,
    quantity: number,
    customPrice: number, // <--- Este es el precio BASE (ej: 9€) que envía Angular
    hasEquivalenceSurcharge: boolean,
  ) {
    // 1. Obtenemos los porcentajes
    const ivaPercentage = product.tax ? product.tax.iva : 0;
    const surchargePercentage =
      product.tax && hasEquivalenceSurcharge ? product.tax.surcharge : 0;

    // 2. EL PRECIO BASE YA ES EL QUE VIENE DEL FRONT (¡Sin fórmula inversa!)
    const basePrice = customPrice;

    // 3. Calculamos el subtotal de la línea (Base * Cantidad)
    const subtotalBase = basePrice * quantity; // Ej: 9 * 10 = 90€

    // 4. Calculamos los impuestos
    const ivaAmount = subtotalBase * (ivaPercentage / 100); // Ej: 90 * 10% = 9€
    const surchargeAmount = subtotalBase * (surchargePercentage / 100);

    // 5. Sumamos todo para el total de la línea
    const totalLinea = subtotalBase + ivaAmount + surchargeAmount; // Ej: 90 + 9 = 99€

    return {
      priceAtTime: Number(basePrice.toFixed(4)), // Guardamos los 9€ intactos
      ivaAtTime: ivaPercentage,
      surchargeAtTime: surchargePercentage,
      totalLinea: totalLinea,
    };
  }
  async findAll(user: User, yearDto?: YearDto): Promise<Order[]> {
    // Si yearDto no existe o yearDto.year es undefined, usamos el año actual.
    const filterYear = yearDto?.year ?? new Date().getFullYear();

    const orders = await this.orderRepository.find({
      where: {
        user: { id: user.id },
        year: filterYear, // Ahora filterYear es siempre un 'number'
      },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });

    return orders;
  }

  async getAvailableYears(user: User): Promise<number[]> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('DISTINCT order.year', 'year')
      .where('order.user = :userId', { userId: user.id })
      .orderBy('year', 'DESC')
      // 1. Le pasamos la interfaz al getRawMany
      .getRawMany<YearResult>();

    // 2. Ahora 'item' ya no es any, es de tipo YearResult
    return result.map((item) => item.year);
  }

  async findOne(id: string, user: User) {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        user: { id: user.id },
      },
      relations: [
        'client',
        'items',
        'items.product', // Anidamos para ver la información del producto dentro de cada línea
      ],
    });

    if (!order) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }

    // Añadimos el objeto summary dinámicamente
    return {
      ...order,
      summary: calculateInvoiceSummary(order.items),
    };
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    user: User,
  ) {
    const { status } = updateOrderStatusDto;

    // 1. Buscamos el pedido (nos traemos las líneas y productos por si hay que tocar stock)
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['items', 'items.product', 'client'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }

    // --- REGLAS DE NEGOCIO ---
    if (order.status === status) {
      return order; // Si ya tiene ese estado, no hacemos nada
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException(
        'Un pedido ya pagado no puede cambiar de estado. Debe emitir un abono/devolución.',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'No se puede reactivar un pedido cancelado. Cree uno nuevo.',
      );
    }

    // --- TRANSACCIÓN SEGURA ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Actualizamos la cabecera
      order.status = status;
      const updatedOrder = await queryRunner.manager.save(order);

      // 3. Reacción en cadena si el pedido se confirma (PAID)
      if (status === OrderStatus.PAID) {
        // TODO: Módulo de Inventario -> Restar el stock de order.items
        // ej: await this.inventoryService.deductStock(order.items, queryRunner);

        //Módulo de Facturación -> Crear el Invoice
        await this.invoicesService.createFromOrder(
          updatedOrder,
          user,
          queryRunner,
        );
      }

      // Si se cancela, también podríamos devolver stock si lo hubiéramos reservado previamente
      if (status === OrderStatus.CANCELLED) {
        // TODO: Lógica de cancelación
      }

      await queryRunner.commitTransaction();

      // Limpiamos el objeto antes de devolverlo (opcional, como hicimos en findOne)
      return updatedOrder;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log('ERROR REAL:', error); // <--- AÑADE ESTO
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error al cambiar el estado del pedido',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
