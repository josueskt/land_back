import {
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthService } from '../services';
import {
  CreateAuthDto,
  LoginUsuarioDto,
  TokenDto,
  UpdateAuthDto,
} from '../dto';
import { PaginationDto } from 'src/common';
import { UsuarioEntity } from '../entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //token concetion
  @Get('user-by-token')
  async getUserByToken(@Query('token') token: string): Promise<UsuarioEntity | null> {
    return this.authService.getUserByToken(token);
  }

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<UsuarioEntity[]> {
    return await this.authService.findAll(paginationDto);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  create(@Body() dto: CreateAuthDto) {
    return this.authService.create(dto);
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: string) {
    return await this.authService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.authService.delete(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('login')
  login(@Body() dto: LoginUsuarioDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: TokenDto) {
    return this.authService.refresh(dto);
  }
}
