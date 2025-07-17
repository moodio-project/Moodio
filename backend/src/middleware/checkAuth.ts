import { Request, Response, NextFunction } from 'express';

export function checkAuth(req: Request, res: Response, next: NextFunction) {
  // TODO: Check if user is authenticated (session/cookie)
  next();
} 