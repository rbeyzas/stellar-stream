import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

// ============================================================================
// Error Response Interface
// ============================================================================

export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  statusCode: number;
}

// ============================================================================
// Standard Error Handler
// ============================================================================

export const handleError = (
  res: Response,
  error: unknown,
  defaultMessage = 'Internal server error',
): void => {
  console.error('API Error:', error);

  if (error instanceof Error) {
    res.status(500).json({
      error: 'ServerError',
      message: error.message || defaultMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } else {
    res.status(500).json({
      error: 'ServerError',
      message: defaultMessage,
    });
  }
};

// ============================================================================
// Validation Error Helper
// ============================================================================

export const validationError = (res: Response, message: string, details?: unknown): void => {
  res.status(400).json({
    error: 'ValidationError',
    message,
    details,
  });
};

// ============================================================================
// Not Found Error Helper
// ============================================================================

export const notFoundError = (res: Response, resource: string, id: string): void => {
  res.status(404).json({
    error: 'NotFound',
    message: `${resource} with ID '${id}' not found`,
  });
};

// ============================================================================
// Conflict Error Helper (e.g., duplicate application)
// ============================================================================

export const conflictError = (res: Response, message: string): void => {
  res.status(409).json({
    error: 'Conflict',
    message,
  });
};

// ============================================================================
// Success Response Helpers
// ============================================================================

export const successResponse = <T>(res: Response, data: T, statusCode = 200): void => {
  res.status(statusCode).json(data);
};

export const createdResponse = <T>(res: Response, data: T): void => {
  res.status(201).json(data);
};

// ============================================================================
// Async Handler Wrapper (catches errors in async route handlers)
// ============================================================================

type AsyncHandler = (req: AuthenticatedRequest, res: Response) => Promise<void>;

export const asyncHandler = (fn: AsyncHandler) => {
  return (req: AuthenticatedRequest, res: Response): void => {
    Promise.resolve(fn(req, res)).catch((error) => {
      handleError(res, error);
    });
  };
};
