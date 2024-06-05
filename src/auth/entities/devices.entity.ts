import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UsuarioEntity } from './auth.entity';
import { SessionEntity } from './session.entity';

@Entity('devices')
export class DevicesEntity {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  nombre: string;

  @Column({
    name: 'ipAddres',
    type: 'varchar',
    unique: true,
    comment: 'Ip',
  })
  ipAddres: string;

  @Column({
    type: 'varchar',
    unique: true,
    comment: 'Token único del dispositivo',
  })
  token: string;

  @Column({
    name: 'macAddres',
    type: 'varchar',
    unique: true,
    comment: 'Ip mac',
  })
  macAddres: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Fecha de creacion del registro',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Fecha de actualizacion de la ultima actualizacion del registro',
  })
  updatedAt: Date;

  @OneToMany(() => SessionEntity, (session) => session.device)
  sessions: SessionEntity[];

  //relaciones
  @ManyToOne(() => UsuarioEntity)
  @JoinColumn()
  user: UsuarioEntity;
}
