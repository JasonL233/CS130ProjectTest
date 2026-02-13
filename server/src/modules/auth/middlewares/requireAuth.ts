import type { Response, NextFunction } from "express";
import type * as express from "express";

/**
 * TEMPORARY PLACEHOLDER AUTH
 * This middleware is ONLY for developing the Expenses module.
 * It injects a hardcoded test userId so expense APIs can be built independently.
 *
 * TODO (Auth owner):
 * - Replace this entire file with real JWT verification
 * - Set req.userId from decoded token (payload.sub)
 *
 * This file should NOT be used in production.
 */

export interface AuthRequest extends express.Request {
  userId: string;
}

export function requireAuth(
  req: express.Request,
  _res: Response,
  next: NextFunction
) {
  (req as AuthRequest).userId = "00000000-0000-0000-0000-000000000001";
  next();
}
/**
 * END
 */