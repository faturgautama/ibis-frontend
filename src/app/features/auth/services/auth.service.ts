import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError, timer } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';

import { User, UserRole, LoginCredentials, AuthResponse } from '../models/user.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { environment } from '../../../../environments/environment';

/**
 * AuthService
 * 
 * Handles authentication and authorization for the application.
 * Supports both demo mode (localStorage) and production mode (API).
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private localStorage = inject(LocalStorageService);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private sessionTimeoutTimer: any;

    constructor() {
        this.initializeAuth();
    }

    /**
     * Initialize authentication state from localStorage
     */
    private initializeAuth(): void {
        const user = this.localStorage.getItem<User>('current_user');
        const token = this.localStorage.getItem<string>('auth_token');

        if (user && token) {
            this.currentUserSubject.next(user);
            this.startSessionTimeout();
        }
    }

    /**
     * Login with credentials
     * @param credentials - User login credentials
     * @returns Observable of AuthResponse
     */
    login(credentials: LoginCredentials): Observable<AuthResponse> {
        if (environment.demoMode) {
            return this.loginDemo(credentials);
        } else {
            return this.loginProduction(credentials);
        }
    }

    /**
     * Demo mode login
     */
    private loginDemo(credentials: LoginCredentials): Observable<AuthResponse> {
        // Simulate API delay
        return timer(500).pipe(
            switchMap(() => {
                // Demo users
                const demoUsers: { [key: string]: { password: string; user: User } } = {
                    'admin@kek.com': {
                        password: 'admin123',
                        user: {
                            id: '1',
                            name: 'Admin User',
                            email: 'admin@kek.com',
                            role: UserRole.ADMIN,
                            active: true,
                            created_at: new Date(),
                            last_login: new Date()
                        }
                    },
                    'warehouse@kek.com': {
                        password: 'warehouse123',
                        user: {
                            id: '2',
                            name: 'Warehouse User',
                            email: 'warehouse@kek.com',
                            role: UserRole.WAREHOUSE,
                            active: true,
                            created_at: new Date(),
                            last_login: new Date()
                        }
                    },
                    'production@kek.com': {
                        password: 'production123',
                        user: {
                            id: '3',
                            name: 'Production User',
                            email: 'production@kek.com',
                            role: UserRole.PRODUCTION,
                            active: true,
                            created_at: new Date(),
                            last_login: new Date()
                        }
                    },
                    'audit@kek.com': {
                        password: 'audit123',
                        user: {
                            id: '4',
                            name: 'Audit User',
                            email: 'audit@kek.com',
                            role: UserRole.AUDIT,
                            active: true,
                            created_at: new Date(),
                            last_login: new Date()
                        }
                    }
                };

                const demoUser = demoUsers[credentials.email];

                if (!demoUser || demoUser.password !== credentials.password) {
                    return throwError(() => ({
                        status: 401,
                        error: { message: 'Invalid email or password' }
                    }));
                }

                const authResponse: AuthResponse = {
                    user: demoUser.user,
                    token: `demo_token_${Date.now()}`,
                    expiresIn: environment.session.timeoutMinutes * 60
                };

                return of(authResponse).pipe(
                    tap(response => this.handleAuthSuccess(response))
                );
            })
        );
    }

    /**
     * Production mode login
     */
    private loginProduction(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
            tap(response => this.handleAuthSuccess(response)),
            catchError(error => {
                console.error('Login error:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Handle successful authentication
     */
    private handleAuthSuccess(response: AuthResponse): void {
        this.localStorage.setItem('current_user', response.user);
        this.localStorage.setItem('auth_token', response.token);
        if (response.refreshToken) {
            this.localStorage.setItem('refresh_token', response.refreshToken);
        }
        this.currentUserSubject.next(response.user);
        this.startSessionTimeout();
    }

    /**
     * Logout user
     */
    logout(): void {
        this.localStorage.removeItem('current_user');
        this.localStorage.removeItem('auth_token');
        this.localStorage.removeItem('refresh_token');
        this.currentUserSubject.next(null);
        this.clearSessionTimeout();
        this.router.navigate(['/auth/login']);
    }

    /**
     * Get current user
     * @returns Observable of current user or null
     */
    getCurrentUser(): Observable<User | null> {
        return this.currentUser$;
    }

    /**
     * Check if user is authenticated
     * @returns true if user is authenticated, false otherwise
     */
    isAuthenticated(): boolean {
        const token = this.localStorage.getItem<string>('auth_token');
        const user = this.currentUserSubject.value;
        return !!(token && user);
    }

    /**
     * Check if user has specific role
     * @param role - Role to check
     * @returns true if user has the role, false otherwise
     */
    hasRole(role: UserRole): boolean {
        const user = this.currentUserSubject.value;
        return user?.role === role;
    }

    /**
     * Check if user has any of the specified roles
     * @param roles - Array of roles to check
     * @returns true if user has any of the roles, false otherwise
     */
    hasAnyRole(roles: UserRole[]): boolean {
        const user = this.currentUserSubject.value;
        return user ? roles.includes(user.role) : false;
    }

    /**
     * Get auth token
     * @returns Auth token or null
     */
    getToken(): string | null {
        return this.localStorage.getItem<string>('auth_token');
    }

    /**
     * Refresh auth token
     * @returns Observable of new AuthResponse
     */
    refreshToken(): Observable<AuthResponse> {
        if (environment.demoMode) {
            // In demo mode, just extend the current session
            const user = this.currentUserSubject.value;
            if (!user) {
                return throwError(() => new Error('No user logged in'));
            }

            const authResponse: AuthResponse = {
                user,
                token: `demo_token_${Date.now()}`,
                expiresIn: environment.session.timeoutMinutes * 60
            };

            return of(authResponse).pipe(
                tap(response => this.handleAuthSuccess(response))
            );
        } else {
            const refreshToken = this.localStorage.getItem<string>('refresh_token');
            if (!refreshToken) {
                return throwError(() => new Error('No refresh token available'));
            }

            return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
                tap(response => this.handleAuthSuccess(response)),
                catchError(error => {
                    this.logout();
                    return throwError(() => error);
                })
            );
        }
    }

    /**
     * Start session timeout timer
     */
    private startSessionTimeout(): void {
        this.clearSessionTimeout();

        const timeoutMs = environment.session.timeoutMinutes * 60 * 1000;
        this.sessionTimeoutTimer = setTimeout(() => {
            this.logout();
        }, timeoutMs);
    }

    /**
     * Clear session timeout timer
     */
    private clearSessionTimeout(): void {
        if (this.sessionTimeoutTimer) {
            clearTimeout(this.sessionTimeoutTimer);
            this.sessionTimeoutTimer = null;
        }
    }

    /**
     * Reset session timeout (call this on user activity)
     */
    resetSessionTimeout(): void {
        if (this.isAuthenticated()) {
            this.startSessionTimeout();
        }
    }
}
