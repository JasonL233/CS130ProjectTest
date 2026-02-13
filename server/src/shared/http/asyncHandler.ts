import type { Request, Response, NextFunction } from "express";

export function asyncHandler<
  T extends Request = Request
>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}
