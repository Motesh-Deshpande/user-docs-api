import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from '../auth/dto/register.dto';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: UserRole.VIEWER,
    transformer: {
      to: (value: UserRole) => value,
      from: (value: string) => value as UserRole,
    },
  })
  role: UserRole;
}
