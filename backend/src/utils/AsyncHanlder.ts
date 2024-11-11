import express from "express";

export function AsyncHandler(
  fn: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void
) {
  return function (req: any, res: any, next: any) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}
