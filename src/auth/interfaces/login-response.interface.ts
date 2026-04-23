import { User } from '../entities/user.entity';

export interface LoginResponse {
  user: Partial<User>;
  token: string;
}
