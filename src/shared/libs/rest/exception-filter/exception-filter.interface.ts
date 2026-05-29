import { NextFunction, Request, Response } from 'express';

export interface ExceptionFilter {
  catch(error: unknown, req: Request, res: Response, next: NextFunction): void;
}
