import { IsDefined, IsEmail, IsString, Length } from 'class-validator';
import { LoginUserMessages } from './login-user.messages.js';
import { UserPassword } from '../user.constant.js';

export class LoginUserDto {
  @IsDefined({ message: LoginUserMessages.email.requiredField })
  @IsEmail({}, { message: LoginUserMessages.email.invalidFormat })
  public email!: string;

  @IsDefined({ message: LoginUserMessages.password.requiredField })
  @IsString({ message: LoginUserMessages.password.invalidFormat })
  @Length(UserPassword.MIN_LENGTH, UserPassword.MAX_LENGTH, { message: LoginUserMessages.password.lengthField })
  public password!: string;
}
