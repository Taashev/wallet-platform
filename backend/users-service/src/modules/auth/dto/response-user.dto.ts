import { Expose } from 'class-transformer';

export class ResponseUserDto {
  @Expose()
  userId: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  about: string;

  @Expose()
  age: number;
}
