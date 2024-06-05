import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CreateUsuarioDto } from '../dto/users/create-user.dto';
import { RoleEntity, UsuarioEntity } from '../entities';
import { RoleEnum } from '../enums/role.enum';
import { MessageDto } from 'src/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolRepository: Repository<RoleEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {}

  async findAll(): Promise<UsuarioEntity[]> {
    const usuarios = await this.rolRepository.findOne({
      where: { nombre: RoleEnum.ADMIN },
    });

    if (!usuarios) {
      throw new NotFoundException(
        new MessageDto('no hay usuarios en la lista'),
      );
    }

    const adminUsers = await this.usuarioRepository.find({
      where: { roles: usuarios },
      relations: ['roles'],
    });

    return adminUsers;
  }

  async create(dto: CreateUsuarioDto): Promise<any> {
    const { nombreUsuario, email } = dto;
    const exists = await this.usuarioRepository.findOne({
      where: [{ nombreUsuario: nombreUsuario }, { email: email }],
    });
    if (exists)
      throw new BadRequestException(new MessageDto('ese usuario ya existe'));
    const rolAdmin = await this.rolRepository.findOne({
      where: { nombre: RoleEnum.ADMIN},
    });
    const rolUser = await this.rolRepository.findOne({
      where: { nombre: RoleEnum.USER },
    });
    if (!rolAdmin || !rolUser)
      throw new InternalServerErrorException(
        new MessageDto('los roles aún no han sido creados'),
      );
    const admin = this.usuarioRepository.create(dto);
    admin.roles = [rolAdmin, rolUser];
    await this.usuarioRepository.save(admin);
    return new MessageDto('admin creado');
  }

  async findOne(id: string): Promise<UsuarioEntity> {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .where('usuario.id = :id', { id })
      .andWhere('roles.nombre = :nombre', { nombre: RoleEnum.ADMIN })
      .getOne();

    if (!usuario) {
      throw new NotFoundException(new MessageDto('No existe el usuario'));
    }

    return usuario;
  }
}
