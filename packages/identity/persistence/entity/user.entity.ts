import { DefaultEntity } from '@tlc/shared-module/typeorm';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'User' })
export class User extends DefaultEntity<User> {
  @PrimaryColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  static create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): User {
    const user = new User({
      id: crypto.randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
    return user;
  }
}
