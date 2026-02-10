export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'AUTH_INVALID_TOKEN', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, 'PERMISSION_DENIED', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `NOT_FOUND_${resource.toUpperCase()}`, `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(409, 'CONFLICT_RESOURCE_EXISTS', message, details);
  }
}

export class InvalidStateError extends AppError {
  constructor(message: string) {
    super(400, 'INVALID_STATE', message);
  }
}

export class FileSizeError extends AppError {
  constructor(message: string) {
    super(400, 'FILE_SIZE_EXCEEDED', message);
  }
}

export class RecordLimitError extends AppError {
  constructor(message: string) {
    super(400, 'RECORD_LIMIT_EXCEEDED', message);
  }
}

export class InviteTokenError extends AppError {
  constructor(message: string) {
    super(400, 'INVALID_INVITE_TOKEN', message);
  }
}
