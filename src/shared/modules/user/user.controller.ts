import { inject, injectable } from 'inversify';
import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  BaseController,
  AnonymousRouteMiddleware,
  ErrorType,
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
import { removeFileIfExists } from '../../helpers/file-system.js';
import { AVATAR_DEFAULT_PATH } from './user.constant.js';

const CONTROLLER_NAME = 'UserController';
const USER_AVATAR_FIELD_NAME = 'avatar';

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
        new UploadFileMiddleware(this.configService.get('UPLOAD_FILES_DIRECTORY'), USER_AVATAR_FIELD_NAME),
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
        new UploadFileMiddleware(this.configService.get('UPLOAD_FILES_DIRECTORY'), USER_AVATAR_FIELD_NAME),
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
      ? { ...req.body, avatarPath: `/${this.configService.get('UPLOAD_FILES_DIRECTORY')}/${req.file.filename}` }
      : req.body;
    const existsUser = await this.userService.findByEmail(createUserPayload.email);

    if (existsUser) {
      await this.removeUploadedAvatar(req.file?.path);
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${createUserPayload.email}» already exists.`,
        CONTROLLER_NAME
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
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);

    if (!req.file) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Avatar file is required',
        CONTROLLER_NAME,
        ErrorType.Validation
      );
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      await this.removeUploadedAvatar(req.file.path);
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'User not found',
        CONTROLLER_NAME,
      );
    }

    const avatarPath = `/${this.configService.get('UPLOAD_FILES_DIRECTORY')}/${req.file.filename}`;
    const previousAvatarFilePath = this.getPreviousAvatarFilePath(user.avatarPath);
    let updatedUser;
    try {
      updatedUser = await this.userService.updateAvatarById(userId, avatarPath);
    } catch (error) {
      await this.removeUploadedAvatar(req.file.path);
      throw error;
    }

    if (!updatedUser) {
      await this.removeUploadedAvatar(req.file.path);
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'User not found',
        CONTROLLER_NAME,
      );
    }

    await this.removePreviousAvatar(previousAvatarFilePath);
    this.created(res, fillDTO(UploadUserAvatarRdo, { avatarPath }));
  }

  public async checkAuthenticate(req: Request, res: Response): Promise<void> {
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);

    const foundUser = await this.userService.findById(userId);

    if (!foundUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        CONTROLLER_NAME,
        ErrorType.Authorization
      );
    }

    this.ok(res, fillDTO(UserRdo, prepareUser(foundUser)));
  }

  private async removeUploadedAvatar(filePath?: string): Promise<void> {
    const isRemoved = await removeFileIfExists(filePath);
    if (filePath && !isRemoved) {
      this.logger.warn(`Could not remove uploaded avatar: ${filePath}`);
    }
  }

  private getPreviousAvatarFilePath(avatarPath?: string): string | undefined {
    if (!avatarPath || avatarPath === AVATAR_DEFAULT_PATH) {
      return undefined;
    }

    const uploadDirectoryPrefix = `/${this.configService.get('UPLOAD_FILES_DIRECTORY')}/`;
    if (!avatarPath.startsWith(uploadDirectoryPrefix)) {
      return undefined;
    }

    return avatarPath.slice(1);
  }

  private async removePreviousAvatar(filePath?: string): Promise<void> {
    const isRemoved = await removeFileIfExists(filePath);
    if (filePath && !isRemoved) {
      this.logger.warn(`Could not remove previous avatar: ${filePath}`);
    }
  }
}
