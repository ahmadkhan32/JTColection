import { Request, Response, NextFunction } from 'express';

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Debug logging
  console.log('Admin middleware check - req.user:', JSON.stringify(req.user, null, 2));
  
  // Validate user exists
  if (!req.user) {
    console.log('No user object found');
    return res.status(401).json({ message: "Unauthorized - No user" });
  }

  // Validate user has role property
  if (!req.user.role) {
    console.log('User has no role property:', JSON.stringify(req.user));
    return res.status(403).json({ message: "Admin only - No role assigned" });
  }

  // Check if user is admin
  if (req.user.role !== "admin") {
    console.log('User is not admin, role is:', req.user.role);
    return res.status(403).json({ message: "Admin only - Insufficient permissions" });
  }

  console.log('Admin check passed for user:', req.user.email || req.user.id);
  next();
};
