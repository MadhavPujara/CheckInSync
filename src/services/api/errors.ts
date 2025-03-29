export class APIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: any
    ) {
        super(message);
        this.name = "APIError";
    }
}

export class AuthenticationError extends APIError {
    constructor(message = "Authentication failed") {
        super(message, 401);
        this.name = "AuthenticationError";
    }
}

export class ValidationError extends APIError {
    constructor(message = "Validation failed") {
        super(message, 400);
        this.name = "ValidationError";
    }
}

export class NetworkError extends APIError {
    constructor(message = "Network request failed") {
        super(message);
        this.name = "NetworkError";
    }
}

export class RateLimitError extends APIError {
    constructor(message = "Rate limit exceeded") {
        super(message, 429);
        this.name = "RateLimitError";
    }
}

export default {
    APIError,
    AuthenticationError,
    ValidationError,
    NetworkError,
    RateLimitError,
};
