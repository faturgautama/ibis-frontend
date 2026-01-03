import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Role Guard Factory
 * 
 * Creates a guard that checks if user has required role(s).
 * Redirects to unauthorized page if user doesn't have required role.
 * 
 * @param roles - Array of allowed roles
 * @returns CanActivateFn
 */
export function roleGuard(roles: UserRole[]): CanActivateFn {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!authService.isAuthenticated()) {
            router.navigate(['/auth/login'], {
                queryParams: { returnUrl: state.url }
            });
            return false;
        }

        if (authService.hasAnyRole(roles)) {
            return true;
        }

        // User doesn't have required role
        router.navigate(['/unauthorized']);
        return false;
    };
}
