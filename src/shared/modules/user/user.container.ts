import { ContainerModule } from 'inversify';
import { types } from '@typegoose/typegoose';
import { UserService } from './user-service.interface.js';
import { Component } from '../../types/index.js';
import { DefaultUserService } from './default-user.service.js';
import { UserEntity, UserModel } from './user.entity.js';

export function createUserContainer(): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind<UserService>(Component.UserService)
      .to(DefaultUserService)
      .inSingletonScope();

    bind<types.ModelType<UserEntity>>(Component.UserModel)
      .toConstantValue(UserModel);
  });
}
