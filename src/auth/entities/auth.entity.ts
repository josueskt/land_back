import * as Bcrypt from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { RoleEntity } from './rol.entity';
import { EnumUsuario } from '../enums/estado_usuario.enum';
import { SessionEntity } from './session.entity';
import { DevicesEntity } from './devices.entity';

@Entity('user')
export class UsuarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'email',
    type: 'varchar',
    unique: true,
    nullable: true,
    comment: 'Correo Electronico',
  })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  nombreUsuario: string;

  @Column({
    name: 'password',
    type: 'varchar',
    comment: 'Contraseña',
  })
  password: string;

    @Column({
    name: 'max_intentos',
    type: 'int',
    default: 3,
    comment:
      'Intentos máximos para errar la contraseña, si llega a cero el usuario se bloquea',
  })
  max_intentos: number;

  @Column({
    type: 'enum',
    enum: EnumUsuario,
    default: EnumUsuario.ACTIVO,
    comment: 'Estado del usuario',
  })
  estado: EnumUsuario;

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

  @ManyToMany(() => RoleEntity, (rol) => rol.usuarios, { eager: true })
  @JoinTable({
    name: 'usuario_rol',
    joinColumn: { name: 'usuario_id' },
    inverseJoinColumn: { name: 'rol_id' },
  })
  roles: RoleEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user)
  session: SessionEntity[];

  @OneToMany(() => DevicesEntity, (device) => device.user)
  devices: DevicesEntity[];

  // Acciones
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password || this.password?.length > 30) {
      return;
    }

    this.password = await Bcrypt.hash(this.password, 10);
  }
}
