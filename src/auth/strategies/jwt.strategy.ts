import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable() //Es un provider se injecta en los providers del modulo auth.module.ts   providers: [..., JwtStrategy]
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET || 'default_secret_key',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //enviarlo como un bearedToken
    });
  }

  //validacion personalizada
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new UnauthorizedException('Invalid token - user not found');

    if (!user.isActive) throw new UnauthorizedException('User is inactive');

    //lo que se retorna aqui, es decir, el usuario y se añade a la REQUEST para tener acceso a sus datos.
    return user;
  }
}
