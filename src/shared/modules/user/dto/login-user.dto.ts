import { IsEmail, IsString, Length } from 'class-validator';
import { LoginUserMessages } from './login-user.messages.js';

export class LoginUserDto {
  @IsEmail({}, { message: LoginUserMessages.email.invalidFormat })
  public email!: string;

  @IsString({ message: LoginUserMessages.password.invalidFormat })
  @Length(6, 12, { message: LoginUserMessages.password.lengthField })
  public password!: string;
}
