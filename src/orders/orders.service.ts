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

    const client = await this.clientRepository.findOne({
      where: { id: clientId, user: { id: user.id } },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con id ${clientId} no encontrado`);
    }

    // --- INICIAMOS EL QUERY RUNNER ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItemsToInsert: OrderItem[] = [];

      for (const item of items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId, user: { id: user.id } },
          relations: ['tax'],
        });

        if (!product) {
          throw new BadRequestException(
            `Producto con id ${item.productId} no válido`,
          );
        }

        const priceAtTime = Number(product.basePrice);
        const appliedTax = client.hasEquivalenceSurcharge
          ? Number(product.tax.iva) + Number(product.tax.surcharge)
          : Number(product.tax.iva);

        // Usamos el manager del queryRunner para crear la instancia
        const orderItem = queryRunner.manager.create(OrderItem, {
          quantity: item.quantity,
          priceAtTime: priceAtTime,
          taxAtTime: appliedTax,
          product: product,
        });

        orderItemsToInsert.push(orderItem);

        const lineSubtotal =
          priceAtTime * item.quantity * (1 + appliedTax / 100);
        totalAmount += lineSubtotal;
      }

      // Creamos la cabecera
      const order = queryRunner.manager.create(Order, {
        client,
        user,
        totalAmount: Number(totalAmount.toFixed(2)),
        items: orderItemsToInsert,
      });

      // Guardamos la orden usando el manager de la transacción
      const savedOrder = await queryRunner.manager.save(order);

      // Si todo ha ido bien, confirmamos los cambios en la base de datos
      await queryRunner.commitTransaction();
      return savedOrder;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Si algo falla (ej: la base de datos se cae a mitad), deshacemos todo
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error creando el pedido, transacción revertida.',
      );
    } finally {
      // Siempre liberamos el queryRunner al terminar
      await queryRunner.release();
    }
  }

  async findAll(user: User) {
    return await this.orderRepository.find({
      where: { user: { id: user.id } },
      relations: ['client'], // Traemos los datos del cliente para la vista de lista
      order: { createdAt: 'DESC' }, // Los más recientes primero
    });
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

    return order;
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
      relations: ['items', 'items.product'],
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
