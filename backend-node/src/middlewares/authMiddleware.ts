import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { environment } from '../config/environment';

// Define the shape of the token payload data structure
export interface TokenPayload {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'premium';
}

// Extend Express internal namespace typing so typescript recognizes custom properties on req context
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication Route Guard Middleware
 * Restricts endpoint consumption to verified account tokens.
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // 1. Verify existence of authorization string header
  if (!authHeader) {
    res.status(401).json({ error: 'Access Denied: No token provided.' });
    return;
  }

  // 2. Validate format structure: Bearer <JWT_STRING>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Access Denied: Authentication format is Bearer <Token>' });
    return;
  }

  const token = parts[1];

  try {
    // 3. Verify digital signature and expiration window parameters
    const decoded = jwt.verify(token, environment.JWT_SECRET) as TokenPayload;

    // 4. Inject payload properties cleanly into downstream thread context
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Exit middleware and let router pass process to controller execution layer
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
       res.status(401).json({ error: 'Authentication Failed: Token has expired.' });
       return;
    }
    
    res.status(401).json({ error: 'Authentication Failed: Invalid cryptographic token payload.' });
  }
};

export default authMiddleware;
