import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userHeader = req.headers.user;
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Raw header type:', typeof userHeader);
    console.log('Raw header value:', userHeader);
    console.log('Header length:', userHeader ? String(userHeader).length : 0);

    if (!userHeader) {
      return res.status(401).json({ message: "Unauthorized - No user header" });
    }

    // Handle both string and object formats
    let user;
    if (typeof userHeader === 'string') {
      try {
        console.log('Attempting to parse string header...');
        user = JSON.parse(userHeader);
        console.log('Successfully parsed user:', user);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse string:', userHeader);
        return res.status(401).json({ message: "Unauthorized - Invalid user format" });
      }
    } else if (typeof userHeader === 'object') {
      console.log('Header is already an object');
      user = userHeader;
    } else {
      return res.status(401).json({ message: "Unauthorized - Invalid user type" });
    }

    if (!user || typeof user !== 'object') {
      return res.status(401).json({ message: "Unauthorized - Invalid user object" });
    }

    req.user = user;
    console.log('User set successfully:', user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
