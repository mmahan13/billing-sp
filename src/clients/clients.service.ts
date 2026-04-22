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

@Injectable()
export class ClientsService {
  private readonly logger = new Logger('ClientsService');

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    try {
      const client = this.clientRepository.create(createClientDto);
      return await this.clientRepository.save(client);
    } catch (error) {
      this.handlerDBExceptions(error);
    }
  }

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) {
      throw new NotFoundException(`El cliente con ID ${id} no existe`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    this.clientRepository.merge(client, updateClientDto);

    try {
      return await this.clientRepository.save(client);
    } catch (error) {
      this.handlerDBExceptions(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
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
