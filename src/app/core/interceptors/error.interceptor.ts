import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

/**
 * Error Interceptor
 * 
 * Global HTTP error handler that intercepts all HTTP errors and provides
 * user-friendly error messages based on HTTP status codes.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An error occurred';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = error.error.message;
            } else {
                // Server-side error
                switch (error.status) {
                    case 400:
                        errorMessage = handleValidationError(error);
                        break;
                    case 401:
                        errorMessage = 'Unauthorized. Please login again.';
                        handleAuthError(router);
                        break;
                    case 403:
                        errorMessage = 'Access denied. You do not have permission to perform this action.';
                        break;
                    case 404:
                        errorMessage = 'Resource not found.';
                        break;
                    case 409:
                        errorMessage = handleConflictError(error);
                        break;
                    case 422:
                        errorMessage = handleBusinessLogicError(error);
                        break;
                    case 502:
                    case 503:
                        errorMessage = 'Service temporarily unavailable. Please try again later.';
                        break;
                    case 500:
                    default:
                        errorMessage = 'An unexpected error occurred. Please try again.';
                }
            }

            notificationService.error(errorMessage);
            return throwError(() => error);
        })
    );
};

/**
 * Handle validation errors (400 Bad Request)
 */
function handleValidationError(error: HttpErrorResponse): string {
    if (error.error?.message) {
        return error.error.message;
    }
    if (error.error?.errors) {
        // Handle validation errors array
        const errors = error.error.errors;
        if (Array.isArray(errors)) {
            return errors.join(', ');
        }
        // Handle validation errors object
        const errorMessages = Object.values(errors).flat();
        return errorMessages.join(', ');
    }
    return 'Invalid request. Please check your input.';
}

/**
 * Handle authentication errors (401 Unauthorized)
 */
function handleAuthError(router: Router): void {
    // Clear session and redirect to login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    router.navigate(['/auth/login']);
}

/**
 * Handle conflict errors (409 Conflict)
 */
function handleConflictError(error: HttpErrorResponse): string {
    if (error.error?.message) {
        return error.error.message;
    }
    return 'A conflict occurred. The resource may already exist or has been modified.';
}

/**
 * Handle business logic errors (422 Unprocessable Entity)
 */
function handleBusinessLogicError(error: HttpErrorResponse): string {
    if (error.error?.message) {
        return error.error.message;
    }
    return 'Business rule violation. Please check your input and try again.';
}
