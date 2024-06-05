import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateRolDto } from '../dto';
import { RoleEntity } from '../entities';
import { RolService } from '../services';

@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Get()
  async getAll(): Promise<RoleEntity[]> {
    return this.rolService.getall();
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  async create(@Body() createRolDto: CreateRolDto): Promise<string> {
    await this.rolService.create(createRolDto);
    return 'Rol creado exitosamente';
  }
}
