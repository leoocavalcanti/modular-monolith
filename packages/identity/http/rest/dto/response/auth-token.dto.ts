import { Expose } from 'class-transformer';

export class AuthTokenDto {
  @Expose()
  access_token: string;

  @Expose()
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}