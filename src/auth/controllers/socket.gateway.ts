// src/gateways/socket.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from '../services/socket.service';

import * as jwt from 'jsonwebtoken';
import { AuthService, UsersService } from '../services';
import { UsuarioEntity } from '../entities';
import { CreateUsuarioDto } from '../dto/users/create-user.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private user: SocketService,
    private auth: AuthService,
  ) {}
// conexion de entrada 
  async handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId as string;
    const token = client.handshake.headers.authorization;
    if (!token && roomId !== 'login' && roomId !== 'register') {
      client.disconnect();
      return;
    } else {
      if (roomId == 'login') {
        console.log('holasdasdsadasdsadasdsadasds');
      } else if (roomId == 'register') {
        console.log('register');
      } else 
      if (roomId != 'login' && roomId != 'register') {
        try {
          const decoded = jwt.verify(token, 'rMRd2023yAvi');
          if (!decoded) {
            client.disconnect();
            console.log('Usuario no válido');
            return;
          }
        } catch (err) {
          client.disconnect();
          console.error('Error al verificar el token:', err);
          return;
        }
      }
    }

    if (roomId) {
      try {
        // Esperar a que se complete la operación onconect_space
        await this.user.onconect_space(roomId, { id: client.id }, token);
        
        // Unirse a la sala
        client.join(roomId);
    
        if (roomId !== 'login' && roomId !== 'register') {
          let clients = await this.user.getAll_space(roomId);
          
          // Simular un retraso de 2 segundos antes de enviar la respuesta
          setTimeout(() => {
            client.to(roomId).emit('conectados', clients);

          }, 2000); // Retraso de 2 segundos (2000 milisegundos)
        }
      } catch (error) {
        console.error('Error al obtener los clientes:', error);
      }
    } else {
      console.log('No se proporcionó el ID de la sala');
    }
    
  }
// desconecion
  handleDisconnect(client: Socket) {
    const roomId = client.handshake.query.roomId as string;
    if (roomId) {
      console.log(`Client ${client.id} disconnected from room ${roomId}`);
      this.user.ondisconected_space(roomId, client.id);
    const clients = this.user.getAll_space(roomId);
      client.to(roomId).emit('conectados', clients);
    }
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = client.handshake.query.roomId as string;
    console.log(`Message from ${client.id} in room ${roomId}: ${message}`);
    client.to(roomId).emit('message', message);
  }

  //logica del login
  @SubscribeMessage('sendtoken')
  async handleToken(
    @MessageBody() token_send: { nombreUsuario: string; password: string },
    @ConnectedSocket() client: Socket,
  ) {
    const toke = client.handshake.query.authorization as string;

    const user = new UsuarioEntity();
    user.nombreUsuario = token_send.nombreUsuario;
    user.password = token_send.password;
    if (toke) {
      client.disconnect();
    }
    const token = await this.auth.login(user);
    console.log(token)
    client.emit('login', token);
  }

  @SubscribeMessage('sendUser')
  async handleregister(
    @MessageBody()
    token_send: CreateUsuarioDto,
    @ConnectedSocket() client: Socket,
  ) {
    const toke = client.handshake.query.authorization as string;

    const user = new UsuarioEntity();
    user.email = token_send.email;
    user.password = token_send.password;
    user.nombreUsuario = token_send.nombreUsuario;
    if (toke) {
      client.disconnect();
    }
    const token = await this.auth.create(user);
    client.emit('message', token);
  }

  @SubscribeMessage('sendImage')
  handleImage(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = client.handshake.query.roomId as string;

    client.to(roomId).emit('image', data); // Notify others in the room about the new image
  }
}
