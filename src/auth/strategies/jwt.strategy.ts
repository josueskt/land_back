import { PayloadInterface } from './../payload.interface';
import { MessageDto } from './../../common/message.dto';
import { JWT_SECRET } from './../../config/constants';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { UsuarioEntity } from '../entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly authRepository: Repository<UsuarioEntity>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(JWT_SECRET),
    });
  }

  async validate(payload: PayloadInterface) {
    const { nombreUsuario, email } = payload;
    const usuario = await this.authRepository.findOne({
      where: [{ nombreUsuario: nombreUsuario }, { email: email }],
    });
    if (!usuario)
      return new UnauthorizedException(new MessageDto('credenciales erróneas'));
    return payload;
  }
}
