import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a valid string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}