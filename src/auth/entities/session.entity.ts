import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { UsuarioEntity } from './auth.entity';
import { DevicesEntity } from './devices.entity';

@Entity('session')
export class SessionEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  active: boolean = true;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  

  //relaciones
  @ManyToOne(() => UsuarioEntity, (user) => user.session, { eager: true })
 @JoinColumn()
 
  user: UsuarioEntity;

  @ManyToOne(() => DevicesEntity, (device) => device.sessions)
  @JoinColumn()
  device: DevicesEntity;
}
