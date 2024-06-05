import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { UsuarioEntity } from './auth.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

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

  // Columnas
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: 'true=activo, false=inactivo',
  })
  isActive: boolean;

  @Column({
    name: 'nombre',
    type: 'varchar',
    unique: true,
    comment: 'Nombre del rol',
  })
  nombre: string;

  // Relaciones
  @ManyToMany(() => UsuarioEntity, (usuario) => usuario.roles)
  usuarios: UsuarioEntity[];
}
