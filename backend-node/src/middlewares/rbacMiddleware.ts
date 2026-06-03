import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Enterprise Role-Based Access Control (RBAC) Authorization Middleware
 * Evaluates the request context session profile tier against an explicit permission array whitelist.
 * * @param allowedRoles Array strings indicating matching security profile clearance levels (e.g. ['admin', 'premium'])
 */
export const rbacMiddleware = (allowedRoles: ('user' | 'premium' | 'admin')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Verify that identity context was already parsed and attached by authMiddleware
    if (!req.user) {
      logger.error('RBAC Middleware Execution Fault: Invoked prior to active Token Verification routing stack.');
      res.status(500).json({ 
        error: 'Internal Authorization Configuration Mismatch: Identity verification context missing.' 
      });
      return;
    }

    const userRole = req.user.role;

    // 2. Map Hierarchy Permissions Rules (e.g., Admins bypass all tier boundaries natively)
    if (userRole === 'admin') {
      return next();
    }

    // 3. Evaluate identity token authorization against configuration rules arrays
    const hasAccessPermission = allowedRoles.includes(userRole);

    if (!hasAccessPermission) {
      logger.warn(`Security Warning: Account verification context [ID: ${req.user.id}, Email: ${req.user.email}] attempted unauthorized boundary breach to endpoint: [${req.originalUrl}]`);
      
      res.status(403).json({
        error: 'Access Denied: Insufficient application tier authorization levels.',
        message: 'This workspace section requires an elevated premium subscription profile matrix or administrator system execution keys.',
      });
      return;
    }

    // Clearance verified -> advance control to subsequent endpoint workflow router thread
    next();
  };
};

export default rbacMiddleware;
