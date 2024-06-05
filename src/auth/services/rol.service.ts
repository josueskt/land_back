import { NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRolDto } from "../dto";
import { RoleEntity } from "../entities";
import { MessageDto } from "src/common";



export class RolService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly rolRepository: Repository<RoleEntity>
    ) { }
    
    async getall(): Promise<RoleEntity[]> {
      const roles = await this.rolRepository.find();
      if (!roles.length)
        throw new NotFoundException(new MessageDto('no hay roles en la lista'));
      return roles;
    }
    
    async create(dto: CreateRolDto) {
      const exists = await this.rolRepository.findOne({
        where: { nombre: dto.nombre },
      });
      if (exists)
        throw new BadRequestException(new MessageDto('ese rol ya existe'));
      await this.rolRepository.save(dto as RoleEntity);
      return new MessageDto('rol creado');  
    }
}