import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity, DevicesEntity, SessionEntity } from '../entities';
import { SessionsService } from './sessions.service';
import * as jwt from 'jsonwebtoken';
interface CLient {
  id:string
}
@Injectable()
export class SocketService {
    constructor(
      @InjectRepository(UsuarioEntity) private userRepository: Repository<UsuarioEntity>,
      @InjectRepository(DevicesEntity) private deviceRepository: Repository<DevicesEntity>,
      @InjectRepository(SessionEntity) private sessionRepository: Repository<SessionEntity>,
      private sesscion_s:SessionsService
    ) {}
  
    async getUserByToken(token: string): Promise<UsuarioEntity | null> {
      try {
        const device = await this.deviceRepository.findOne({
          where: { token },
          relations: ['user'],
        });
        
        if (!device) {
          return null;
        }
  
        return device.user;
      } catch (error) {
        console.error('Error al obtener el usuario por token:', error);
        return null;
      }
    }
  
    async getDeviceByMacAddress(macAddres: string): Promise<DevicesEntity> {
      // Lógica para obtener el dispositivo por la dirección MAC
      return this.deviceRepository.findOne({ where: { macAddres } });
    }
  
    async createSession(user: UsuarioEntity, device: DevicesEntity): Promise<SessionEntity> {
      // Lógica para crear una nueva sesión
      const session = new SessionEntity();
      session.user = user;
      session.device = device;
      session.active = true;
      session.startedAt = new Date();
      return this.sessionRepository.save(session);
    }
  
    async getSessionByClientId(clientId:string): Promise<SessionEntity> {
      // Lógica para obtener la sesión por el ID del cliente de socket
      return this.sessionRepository.findOne({ where: { id: clientId } });
    }
  
    async endSession(session: SessionEntity): Promise<void> {
      // Lógica para finalizar una sesión
      session.endedAt = new Date();
      session.active = false;
      await this.sessionRepository.save(session);
    }


    private clients:Record<string,CLient> = {}

  onconect(client:CLient){

  this.clients[client.id] = client

  

  }
  ondisconected(id:string){
      delete this.clients[id]
      
  }
  getall(){
      return Object.values(this.clients)
  }


  private namespaceClients: { [namespace: string]: { [id: string]: CLient } } = {};

  onconect_space(namespace: string, client: CLient , token:string) {
    if (!this.namespaceClients[namespace]) {
      this.namespaceClients[namespace] = {};
    }
    const idExtraido = this.extraerIDDesdeToken(token);




    const session = new SessionEntity();
const usuer = new UsuarioEntity()
usuer.id = idExtraido
session.id = namespace.toString()
session.user= usuer;
//session.user = {"id":token}
  this.sesscion_s.save(session)
    this.namespaceClients[namespace][client.id] = client;
  }

  ondisconected_space(namespace: string, id: string) {
    if (this.namespaceClients[namespace]) {
      delete this.namespaceClients[namespace][id];
      if (Object.keys(this.namespaceClients[namespace]).length === 0) {
        delete this.namespaceClients[namespace];
      }
    }
  }

  async getAll_space(namespace: string) {

   const session =   await this.sesscion_s.findOneWithUserId(namespace)
   console.log(session)
    return session 
  }


  


  extraerIDDesdeToken(token: string): string | null {
    try {
      // Verificar y decodificar el token
      const decodedToken: any = jwt.verify(token, 'rMRd2023yAvi'); // Reemplaza 'tu_clave_secreta' con tu clave secreta real
  
      // Extraer el ID del token decodificado
      const id: string = decodedToken.id;
  
      return id;
    } catch (error) {
      // Manejar cualquier error que pueda ocurrir durante la verificación o decodificación del token
      console.error('Error al extraer el ID desde el token:', error);
      return null;
    }
  }
  
  }
