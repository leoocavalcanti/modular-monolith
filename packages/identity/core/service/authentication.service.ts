import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserRepository } from '../../persistence/repository/user.repository';
import { UserUnauthorizedException } from '../exception/user-unauthorized.exception';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepository.findOneByEmail(email);

    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new UserUnauthorizedException(`Cannot authorize user: ${email}`);
    }
    
    //TODO add more fields to the JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      // Using HS256 algorithm to prenvent from security risk
      // https://book.hacktricks.xyz/pentesting-web/hacking-jwt-json-web-tokens#modify-the-algorithm-to-none-cve-2015-9235
      algorithm: 'HS256',
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
  private async comparePassword(
    password: string,
    actualPassword: string
  ): Promise<boolean> {
    return compare(password, actualPassword);
  }
}
