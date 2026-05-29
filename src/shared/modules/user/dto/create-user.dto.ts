import { UserType } from '../../../types/index.js';
import { IsDefined, IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { CreateUserMessages } from './create-user.messages.js';
import { UserName, UserPassword } from '../user.constant.js';

export class CreateUserDto {
  @IsDefined({ message: CreateUserMessages.name.requiredField })
  @IsString({ message: CreateUserMessages.name.invalidFormat })
  @Length(UserName.MIN_LENGTH, UserName.MAX_LENGTH, { message: CreateUserMessages.name.lengthField })
  public name!: string;

  @IsDefined({ message: CreateUserMessages.email.requiredField })
  @IsEmail({}, { message: CreateUserMessages.email.invalidFormat })
  public email!: string;

  @IsDefined({ message: CreateUserMessages.password.requiredField })
  @IsString({ message: CreateUserMessages.password.invalidFormat })
  @Length(UserPassword.MIN_LENGTH, UserPassword.MAX_LENGTH, { message: CreateUserMessages.password.lengthField })
  public password!: string;

  @IsDefined({ message: CreateUserMessages.type.requiredField })
  @IsEnum(UserType, { message: CreateUserMessages.type.invalidFormat })
  public type!: UserType;
}
