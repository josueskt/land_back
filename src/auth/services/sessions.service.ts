import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';
import { SessionEntity } from '../entities';

@Injectable()
export class SessionsService {

    constructor(
        @InjectRepository(SessionEntity)
        private sessionsRepository: Repository<SessionEntity>,
      ) {}
    
      async save(secion:SessionEntity):Promise<string>{
       await  this.sessionsRepository.save(secion)
      return "usuario creado"
      }
      findAll(): Promise<SessionEntity[]> {
        return this.sessionsRepository.find();
      }
    
      findOne(id: string): Promise<SessionEntity> {
        return this.sessionsRepository.findOne({ where: { id } });
      }

      async findOneWithUserId(id: string): Promise<{ session: SessionEntity, userId: string }> {
        setTimeout(()=>{},4000)
        const session = await this.sessionsRepository.findOne({ where: { id }, relations: ['user'] });
    
    
      //  const userId = session.user.id;
      const userId = "1";
    
        return { session, userId };
      }
    


    
      closeSession(id: string): Promise<void> {
        return this.sessionsRepository.update(id, { active: false }).then(() => {});
      }
}
