import { inject, injectable } from 'inversify';
import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  BaseController,
  AnonymousRouteMiddleware,
  HttpError,
  HttpMethod,
  PrivateRouteMiddleware,
  UploadFileMiddleware,
  ValidateDtoMiddleware,
} from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { UserService } from './user-service.interface.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { LoginUserRequest } from './types/login-user-request.type.js';
import { CreateUserRequest } from './types/create-user-request.type.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { fillDTO, prepareUser } from '../../helpers/index.js';
import { UserRdo } from './rdo/user.rdo.js';
import { AuthService } from '../auth/index.js';
import { LoggedUserRdo } from './rdo/logged-user.rdo.js';
import { UploadUserAvatarRdo } from './rdo/upload-user-avatar.rdo.js';
import { unlink } from 'node:fs/promises';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
    @inject(Component.AuthService) private readonly authService: AuthService,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController…');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new AnonymousRouteMiddleware(),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
        new ValidateDtoMiddleware(CreateUserDto)
      ]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [
        new ValidateDtoMiddleware(LoginUserDto)
      ]
    });
    this.addRoute({
      path: '/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new PrivateRouteMiddleware(),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
      ]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.checkAuthenticate,
      middlewares: [
        new PrivateRouteMiddleware()
      ]
    });
  }

  public async create(
    req: CreateUserRequest,
    res: Response,
  ): Promise<void> {
    const createUserPayload = req.file
      ? { ...req.body, avatarPath: `/upload/${req.file.filename}` }
      : req.body;
    const existsUser = await this.userService.findByEmail(createUserPayload.email);

    if (existsUser) {
      await this.removeUploadedAvatar(req.file?.path);
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${createUserPayload.email}» exists.`,
        'UserController'
      );
    }

    let result;
    try {
      result = await this.userService.create(createUserPayload, this.configService.get('SALT'));
    } catch (error) {
      await this.removeUploadedAvatar(req.file?.path);
      throw error;
    }

    this.created(res, fillDTO(UserRdo, prepareUser(result)));
  }

  public async login(
    { body }: LoginUserRequest,
    res: Response,
  ): Promise<void> {
    const user = await this.authService.verify(body);
    const token = await this.authService.authenticate(user);
    const responseData = fillDTO(LoggedUserRdo, {
      email: user.email,
      token,
    });
    this.ok(res, responseData);
  }

  public async uploadAvatar(
    req: Request,
    res: Response,
  ): Promise<void> {
    const userId = this.getRequiredUserId(req);

    if (!req.file) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Avatar file is required',
        'UserController',
      );
    }

    const avatarPath = `/upload/${req.file.filename}`;
    const updatedUser = await this.userService.updateAvatarById(userId, avatarPath);

    if (!updatedUser) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'User not found',
        'UserController',
      );
    }

    this.created(res, fillDTO(UploadUserAvatarRdo, { avatarPath }));
  }

  public async checkAuthenticate(req: Request, res: Response) {
    const userId = this.getRequiredUserId(req);

    const foundedUser = await this.userService.findById(userId);

    if (!foundedUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    this.ok(res, fillDTO(UserRdo, prepareUser(foundedUser)));
  }

  private getRequiredUserId(req: Request): string {
    const userId = req.tokenPayload?.id;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController',
      );
    }

    return userId;
  }

  private async removeUploadedAvatar(filePath?: string): Promise<void> {
    if (!filePath) {
      return;
    }

    try {
      await unlink(filePath);
    } catch {
      this.logger.warn(`Could not remove uploaded avatar: ${filePath}`);
    }
  }
}
