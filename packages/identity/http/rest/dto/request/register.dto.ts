import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a valid string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'First name must be a valid string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @IsString({ message: 'Last name must be a valid string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;
}