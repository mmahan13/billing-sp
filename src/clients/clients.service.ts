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

  async findAll(user: User): Promise<Client[]> {
    return await this.clientRepository
      .createQueryBuilder('client')
      // 1. Filtramos por el usuario logueado
      .where('client.user = :userId', { userId: user.id })

      // 2. Esta es la magia: cuenta las facturas y las mete en 'invoicesCount'
      // 'client.invoices' debe ser el nombre de la relación @OneToMany
      .loadRelationCountAndMap('client.invoicesCount', 'client.invoices')

      // 3. Ordenamos como tenías antes
      .orderBy('client.createdAt', 'DESC')

      .getMany();
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
