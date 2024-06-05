import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWT_SECRET } from 'src/config/constants';
import { AuthController } from './controllers/auth.controller';
import { DevicesEntity, RoleEntity, SessionEntity, UsuarioEntity } from './entities';
import { AuthService, RolService } from './services';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsuarioController } from './controllers/usuario.controller';
import { RolController } from './controllers/rol.controller';
import { UsersService } from './services/users.service';
import { SessionsService } from './services/sessions.service';
import { SocketService } from './services/socket.service';
import { ChatGateway } from './controllers/socket.gateway';


@Module({
    imports: [
      TypeOrmModule.forFeature([UsuarioEntity, RoleEntity, SessionEntity, DevicesEntity]),
      PassportModule.register({
        defaultStrategy: 'jwt',
      }),
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get(JWT_SECRET),
          signOptions: {
            expiresIn: 7200,
          },
        }),
        inject: [ConfigService],
      }), 
    ],
    providers: [AuthService, UsersService, RolService, SessionsService,ChatGateway, ConfigService, JwtStrategy, SocketService],
    controllers: [AuthController, UsuarioController, RolController],
    exports: [PassportModule, JwtStrategy],
  })
  export class AuthModule {}
