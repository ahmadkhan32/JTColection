import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required',
      });
    }

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Authorization failed',
    });
  }
};
