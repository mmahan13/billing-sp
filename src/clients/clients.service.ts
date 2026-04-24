import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginatedResponse } from 'src/interfaces/paginate-response.model';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getTenantWhere } from 'src/common/utils/tenant.util';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger('ClientsService');

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, user: User): Promise<Client> {
    try {
      // Instanciamos el cliente y le asignamos directamente su dueño
      const client = this.clientRepository.create({
        ...createClientDto,
        user,
      });
      return await this.clientRepository.save(client);
    } catch (error) {
      this.handlerDBExceptions(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    user: User,
  ): Promise<PaginatedResponse<Client>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [clients, total] = await this.clientRepository.findAndCount({
      skip,
      take: limit,
      // Magia pura: El helper decide si filtra por usuario o si lo trae todo (si es admin)
      where: getTenantWhere<Client>(user),
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: clients,
      meta: {
        totalItems: total,
        itemCount: clients.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string, user: User): Promise<Client> {
    const client = await this.clientRepository.findOne({
      // Le pasamos el user y las condiciones extra que necesitamos (el id del cliente)
      where: getTenantWhere<Client>(user, { id }),
    });

    if (!client) {
      throw new NotFoundException(`El cliente con ID ${id} no existe`);
    }
    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    user: User,
  ): Promise<Client> {
    // 1. Buscamos el cliente (el findOne ya comprueba que le pertenece o si es Admin)
    const client = await this.findOne(id, user);

    // 2. Mezclamos los datos
    this.clientRepository.merge(client, updateClientDto);

    // 3. Dejamos rastro de quién hizo la actualización (Incluso si fue un Admin)
    client.updatedBy = user.id;

    try {
      return await this.clientRepository.save(client);
    } catch (error) {
      this.handlerDBExceptions(error);
    }
  }

  async remove(id: string, user: User): Promise<void> {
    // Reutilizamos el findOne para asegurarnos de que el cliente existe y es suyo (o es Admin) antes de borrarlo
    await this.findOne(id, user);
    await this.clientRepository.softDelete(id);
  }

  private handlerDBExceptions(error: any): never {
    // Error 23505: NIF/CIF duplicado
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === '23505') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Error inesperado, revisa los logs del servidor',
    );
  }
}
