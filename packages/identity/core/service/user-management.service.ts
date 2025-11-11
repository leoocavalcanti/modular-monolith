import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { User } from '../../persistence/entity/user.entity';
import { UserRepository } from '../../persistence/repository/user.repository';
import { UserAlreadyExistsException } from '../exception/user-already-exists.exception';
import { hash } from 'bcrypt';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

//TODO move to a configuration
export const PASSWORD_HASH_SALT = 10;

@Injectable()
export class UserManagementService {
  constructor(private readonly userRepository: UserRepository) {}
  @Transactional({ connectionName: 'identity' })
  async create(user: CreateUserDto) {
    const existingUser = await this.userRepository.findOneByEmail(user.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(`User with email ${user.email} already exists`);
    }

    const newUser = User.create({
      ...user,
      password: await hash(user.password, PASSWORD_HASH_SALT),
    });

    await this.userRepository.save(newUser);
    return newUser;
  }

  async getUserById(id: string) {
    return this.userRepository.findOneById(id);
  }
}
