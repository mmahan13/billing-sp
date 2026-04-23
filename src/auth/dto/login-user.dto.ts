import { IsString, Matches } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @Matches(/^[A-Z]\d{6}$/, {
    message:
      'The bbvaUserId must begin with a capital letter followed by 6 numbers (e.g., T018108)',
  })
  bbvaUserId: string;
}
