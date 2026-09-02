import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class AdminAuthSignInDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password!: string;
}
