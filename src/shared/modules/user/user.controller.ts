import { inject, injectable } from 'inversify';
import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BaseController, HttpError, HttpMethod, ValidateDtoMiddleware } from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { UserService } from './user-service.interface.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { LoginUserRequest } from './types/login-user-request.type.js';
import { CreateUserRequest } from './types/create-user-request.type.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { createSHA256, fillDTO } from '../../helpers/index.js';
import { UserRdo } from './rdo/user.rdo.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController…');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
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
    this.addRoute({ path: '/logout', method: HttpMethod.Post, handler: this.logout });
    this.addRoute({ path: '/profile', method: HttpMethod.Get, handler: this.profile });
  }

  public async create(
    { body }: CreateUserRequest,
    res: Response,
  ): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${body.email}» exists.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.created(res, fillDTO(UserRdo, result));
  }

  public async login(
    { body }: LoginUserRequest,
    res: Response,
  ): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (!existsUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        `User with email ${body.email} not found.`,
        'UserController',
      );
    }

    const passwordHash = createSHA256(body.password, this.configService.get('SALT'));
    const isPasswordValid = passwordHash === existsUser.getPassword();

    if (!isPasswordValid) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Incorrect email or password.',
        'UserController',
      );
    }

    this.ok(res, { token: String(existsUser._id) });
  }

  public async logout(
    req: Request,
    res: Response,
  ): Promise<void> {
    this.getUserId(req);
    this.ok(res, { message: 'Logout completed' });
  }

  public async profile(
    req: Request,
    res: Response,
  ): Promise<void> {
    const userId = this.getUserId(req);
    const existsUser = await this.userService.findById(userId);

    if (!existsUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        'UserController',
      );
    }

    this.ok(res, fillDTO(UserRdo, existsUser));
  }

  private getUserId(req: Request): string {
    const userId = req.headers['x-user-id'];
    const value = Array.isArray(userId) ? userId[0] : userId;

    if (!value) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        'UserController',
      );
    }

    return value;
  }
}
