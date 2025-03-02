// Custom error types for the application
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string = "Network connection issue. Please check your internet connection.",
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication error. Please sign in again.") {
    super(message);
    this.name = "AuthError";
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed. Please try again.",
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = "Invalid input. Please check your data and try again.",
  ) {
    super(message);
    this.name = "ValidationError";
  }
}
