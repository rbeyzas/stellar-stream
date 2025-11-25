import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Extended Request Interface with User
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string; // User ID (can be admin or ambassador)
    role: 'admin' | 'ambassador';
    ambassadorId?: string; // Only set for ambassadors
  };
}

// ============================================================================
// Authentication Middleware (Stub)
// ============================================================================
// NOTE: This is a stub. In production, you would:
// 1. Verify JWT token from Authorization header
// 2. Decode token to get user ID and role
// 3. Optionally fetch user from database to verify they exist
// 4. Set req.user with the authenticated user info

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // STUB: In production, validate JWT token here
    // Example: const token = req.headers.authorization?.split(' ')[1];
    // Example: const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For now, we'll simulate an authenticated user
    // You would replace this with actual JWT validation
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No authorization header provided',
      });
      return;
    }

    // STUB: Mock user extraction from token
    // In production: decode JWT and fetch user from DB
    req.user = {
      id: 'mock-user-id',
      role: 'admin', // or 'ambassador'
      ambassadorId: undefined, // Set this if role === 'ambassador'
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or expired token',
    });
  }
};

// ============================================================================
// Role-Based Authorization Middleware
// ============================================================================

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
    return;
  }

  next();
};

export const requireAmbassador = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'ambassador') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Ambassador access required',
    });
    return;
  }

  if (!req.user.ambassadorId) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Ambassador profile not found',
    });
    return;
  }

  next();
};

// Allow either admin or ambassador
export const requireAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  next();
};
