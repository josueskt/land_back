/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto, LoginUsuarioDto, TokenDto, UpdateAuthDto } from '../dto';
import { Repository } from 'typeorm';
import { DevicesEntity, RoleEntity, UsuarioEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageDto, PaginationDto } from 'src/common';
import { RoleEnum } from '../enums/role.enum';
import { PayloadInterface } from '../payload.interface';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolRepository: Repository<RoleEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly authRepository: Repository<UsuarioEntity>,
    private readonly jwtService: JwtService,
    @InjectRepository(DevicesEntity)
    private readonly devicesRepository: Repository<DevicesEntity>,
  ){}

 async create(dto: CreateAuthDto): Promise<any> {
  const { nombreUsuario, email } = dto;
  const exists = await this.authRepository.findOne({
    where: [{ nombreUsuario: nombreUsuario }, { email: email }],
  });
  if (exists)
    throw new BadRequestException(new MessageDto('ese usuario ya existe'));
  const rolUser = await this.rolRepository.findOne({
    where: { nombre: RoleEnum.USER },
  });
  if (!rolUser)
    throw new InternalServerErrorException(
      new MessageDto('los roles aún no han sido creados'),
    );
  const user = this.authRepository.create(dto);
  user.roles = [rolUser];
  await this.authRepository.save(user);
  return new MessageDto('usuario creado');
  }

  async findAll(paginationDto: PaginationDto): Promise<UsuarioEntity[]> {
    const { limit, offset } = paginationDto;

    const usuarios = await this.authRepository.find({
      take: limit,
      skip: offset,
    });

    if (!usuarios.length) {
      throw new NotFoundException(new MessageDto('No hay usuarios en la lista'));
    }

    return usuarios;
  }

  async findOne(id: string): Promise<UsuarioEntity> {
    const usuario = await this.authRepository.findOne({
      where: { id: id },
    });
    if (!usuario) {
      throw new NotFoundException(new MessageDto('No existe el usuario'));
    }
    return usuario;
  }


  async update(id: string, usuario: UpdateAuthDto) {
    const existingUser = await this.authRepository.findOne( { where: { id:id}, } );

    if (!existingUser) {
      throw new NotFoundException(new MessageDto('Usuario no encontrado'));    }   
    
    const { password, ...restoUsuario } = usuario;  
    this.authRepository.update(id, restoUsuario); 
    await this.authRepository.save(existingUser);    
    return new MessageDto(`Usuario editado ${restoUsuario.nombreUsuario} exitosamente`);
  }  


  
  async delete(id: string): Promise<MessageDto> {
    const user = await this.authRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new NotFoundException(new MessageDto('Usuario no encontrado'));
    }

    await this.authRepository.remove(user);
    return new MessageDto('Usuario eliminado exitosamente');
  }

  async login(dto: LoginUsuarioDto): Promise<any> {
    const { nombreUsuario } = dto;
    const usuario = await this.authRepository.findOne({
      where: [ { email: nombreUsuario }],
    });
    if (!usuario)
      return new UnauthorizedException(new MessageDto('no existe el usuario'));
    const passwordOK = await compare(dto.password, usuario.password);
    if (!passwordOK)
      return new UnauthorizedException(new MessageDto('contraseña errónea'));
    const payload: PayloadInterface = {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      email: usuario.email,
      roles: usuario.roles.map((rol) => rol.nombre as RoleEnum),
    };
    const token = await this.jwtService.sign(payload);
    return { token };
  }

  
  async refresh(dto: TokenDto): Promise<any> {
    const usuario = await this.jwtService.decode(dto.token);
    const payload: PayloadInterface = {
      id: usuario[`id`],
      nombreUsuario: usuario[`nombreUsuario`],
      email: usuario[`email`],
      roles: usuario[`roles`],
    };
    const token = await this.jwtService.sign(payload);
    return { token };
  }

  async getUserByToken(token: string): Promise<UsuarioEntity | null> {
    try {
      const device = await this.devicesRepository.findOne({
        where: { token },
        relations: ['user'],
      });
      
      if (!device) {
        throw new NotFoundException('Token no encontrado');
      }

      return device.user;
    } catch (error) {
      console.error('Error al obtener el usuario por token:', error);
      return null;
    }
  }


  
}
