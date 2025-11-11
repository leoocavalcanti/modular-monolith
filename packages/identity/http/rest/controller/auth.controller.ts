import { Controller, Post, Body, UnauthorizedException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../../../core/service/authentication.service';
import { UserManagementService } from '../../../core/service/user-management.service';
import { UserAlreadyExistsException } from '../../../core/exception/user-already-exists.exception';
import { SignInDto } from '../dto/request/sign-in.dto';
import { RegisterDto } from '../dto/request/register.dto';
import { AuthTokenDto } from '../dto/response/auth-token.dto';
import { UserDto } from '../dto/response/user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userManagementService: UserManagementService
  ) {}

  @Post('login')
  async signIn(@Body() signInDto: SignInDto): Promise<AuthTokenDto> {
    try {
      const result = await this.authService.signIn(signInDto.email, signInDto.password);
      
      return plainToInstance(AuthTokenDto, result, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new UnauthorizedException(
        `Cannot authorize user: ${(error as Error).message}`
      );
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserDto> {
    try {
      const user = await this.userManagementService.create(registerDto);
      
      return plainToInstance(UserDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}