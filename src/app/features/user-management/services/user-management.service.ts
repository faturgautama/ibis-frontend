import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import {
    User,
    UserActivity,
    UserRole,
    UserStatus,
    PasswordChangeRequest,
    PasswordResetRequest,
    validatePassword
} from '../models/user.model';

/**
 * User Management Service
 * Requirements: 19.1-19.8
 */
@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private localStorageService = inject(LocalStorageService);
    private readonly USERS_KEY = 'users';
    private readonly ACTIVITIES_KEY = 'user_activities';

    constructor() {
        this.initializeDemoData();
    }

    /**
     * Initialize demo data
     */
    private initializeDemoData(): void {
        const existingUsers = this.localStorageService.getItem<User[]>(this.USERS_KEY);
        if (!existingUsers || existingUsers.length === 0) {
            const demoUsers: User[] = [
                {
                    id: '1',
                    username: 'admin',
                    email: 'admin@example.com',
                    full_name: 'System Administrator',
                    role: UserRole.ADMIN,
                    status: UserStatus.ACTIVE,
                    phone: '+62812345678',
                    department: 'IT',
                    created_at: new Date(),
                    created_by: 'system'
                },
                {
                    id: '2',
                    username: 'warehouse',
                    email: 'warehouse@example.com',
                    full_name: 'Warehouse Manager',
                    role: UserRole.WAREHOUSE,
                    status: UserStatus.ACTIVE,
                    department: 'Warehouse',
                    created_at: new Date(),
                    created_by: 'admin'
                },
                {
                    id: '3',
                    username: 'production',
                    email: 'production@example.com',
                    full_name: 'Production Manager',
                    role: UserRole.PRODUCTION,
                    status: UserStatus.ACTIVE,
                    department: 'Production',
                    created_at: new Date(),
                    created_by: 'admin'
                }
            ];
            this.localStorageService.setItem(this.USERS_KEY, demoUsers);
        }
    }

    /**
     * Get all users
     * Requirement: 19.1
     */
    getAllUsers(): Observable<User[]> {
        const users = this.localStorageService.getItem<User[]>(this.USERS_KEY) || [];
        return of(users).pipe(delay(200));
    }

    /**
     * Get user by ID
     */
    getUserById(id: string): Observable<User | null> {
        const users = this.localStorageService.getItem<User[]>(this.USERS_KEY) || [];
        const user = users.find(u => u.id === id);
        return of(user || null).pipe(delay(200));
    }

    /**
     * Create user
     * Requirement: 19.1, 19.2
     */
    createUser(user: Omit<User, 'id' | 'created_at'>, password: string, createdBy: string): Observable<User> {
        // Validate password
        const validation = validatePassword(password);
        if (!validation.valid) {
            return throwError(() => ({
                error: { message: validation.errors.join(', ') }
            }));
        }

        const users = this.localStorageService.getItem<User[]>(this.USERS_KEY) || [];

        // Check if username already exists
        if (users.some(u => u.username === user.username)) {
            return throwError(() => ({
                error: { message: 'Username already exists' }
            }));
        }

        // Check if email already exists
        if (users.some(u => u.email === user.email)) {
            return throwError(() => ({
                error: { message: 'Email already exists' }
            }));
        }

        const newUser: User = {
            ...user,
            id: Date.now().toString(),
            created_at: new Date(),
            created_by: createdBy
        };

        users.push(newUser);
        this.localStorageService.setItem(this.USERS_KEY, users);

        // Log activity
        this.logActivity(createdBy, 'CREATE_USER', 'USER', newUser.id, {
            username: newUser.username,
            role: newUser.role
        });

        return of(newUser).pipe(delay(300));
    }

    /**
     * Update user
     * Requirement: 19.1
     */
    updateUser(id: string, updates: Partial<User>, updatedBy: string): Observable<User> {
        const users = this.localStorageService.getItem<User[]>(this.USERS_KEY) || [];
        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return throwError(() => ({ error: { message: 'User not found' } }));
        }

        const updatedUser: User = {
            ...users[index],
            ...updates,
            id, // Ensure ID doesn't change
            updated_at: new Date(),
            updated_by: updatedBy
        };

        users[index] = updatedUser;
        this.localStorageService.setItem(this.USERS_KEY, users);

        // Log activity
        this.logActivity(updatedBy, 'UPDATE_USER', 'USER', id, updates);

        return of(updatedUser).pipe(delay(300));
    }

    /**
     * Delete user
     * Requirement: 19.1
     */
    deleteUser(id: string, deletedBy: string): Observable<void> {
        let users = this.localStorageService.getItem<User[]>(this.USERS_KEY) || [];
        const user = users.find(u => u.id === id);

        if (!user) {
            return throwError(() => ({ error: { message: 'User not found' } }));
        }

        users = users.filter(u => u.id !== id);
        this.localStorageService.setItem(this.USERS_KEY, users);

        // Log activity
        this.logActivity(deletedBy, 'DELETE_USER', 'USER', id, {
            username: user.username
        });

        return of(void 0).pipe(delay(300));
    }

    /**
     * Change password
     * Requirements: 19.4, 19.5
     */
    changePassword(request: PasswordChangeRequest): Observable<void> {
        // Validate new password
        const validation = validatePassword(request.new_password);
        if (!validation.valid) {
            return throwError(() => ({
                error: { message: validation.errors.join(', ') }
            }));
        }

        // Check if passwords match
        if (request.new_password !== request.confirm_password) {
            return throwError(() => ({
                error: { message: 'Passwords do not match' }
            }));
        }

        // In production, verify old password with backend
        // For demo, just simulate success

        // Log activity
        this.logActivity(request.user_id, 'CHANGE_PASSWORD', 'USER', request.user_id);

        return of(void 0).pipe(delay(300));
    }

    /**
     * Reset password
     * Requirement: 19.6
     */
    resetPassword(request: PasswordResetRequest): Observable<void> {
        const users = this.localStorageService.getItem<User[]>(this.USERS_KEY) || [];
        const user = users.find(u => u.email === request.email);

        if (!user) {
            return throwError(() => ({
                error: { message: 'User not found' }
            }));
        }

        if (request.new_password) {
            // Validate new password
            const validation = validatePassword(request.new_password);
            if (!validation.valid) {
                return throwError(() => ({
                    error: { message: validation.errors.join(', ') }
                }));
            }
        }

        // In production, send reset email or update password
        // For demo, just simulate success

        // Log activity
        this.logActivity('system', 'RESET_PASSWORD', 'USER', user.id);

        return of(void 0).pipe(delay(300));
    }

    /**
     * Log user activity
     * Requirement: 19.8
     */
    logActivity(
        userId: string,
        action: string,
        entityType?: string,
        entityId?: string,
        details?: any
    ): void {
        const activities = this.localStorageService.getItem<UserActivity[]>(this.ACTIVITIES_KEY) || [];

        const users = this.localStorageService.getItem<User[]>(this.USERS_KEY) || [];
        const user = users.find(u => u.id === userId);

        const activity: UserActivity = {
            id: Date.now().toString(),
            user_id: userId,
            username: user?.username || 'unknown',
            action,
            entity_type: entityType,
            entity_id: entityId,
            timestamp: new Date(),
            details
        };

        activities.push(activity);

        // Keep only last 1000 activities
        if (activities.length > 1000) {
            activities.splice(0, activities.length - 1000);
        }

        this.localStorageService.setItem(this.ACTIVITIES_KEY, activities);
    }

    /**
     * Get user activities
     * Requirement: 19.7, 19.8
     */
    getUserActivities(userId?: string, limit?: number): Observable<UserActivity[]> {
        let activities = this.localStorageService.getItem<UserActivity[]>(this.ACTIVITIES_KEY) || [];

        if (userId) {
            activities = activities.filter(a => a.user_id === userId);
        }

        // Sort by timestamp descending
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (limit) {
            activities = activities.slice(0, limit);
        }

        return of(activities).pipe(delay(200));
    }

    /**
     * Update user status
     */
    updateUserStatus(id: string, status: UserStatus, updatedBy: string): Observable<User> {
        return this.updateUser(id, { status }, updatedBy);
    }

    /**
     * Get users by role
     */
    getUsersByRole(role: UserRole): Observable<User[]> {
        const users = this.localStorageService.getItem<User[]>(this.USERS_KEY) || [];
        const filtered = users.filter(u => u.role === role);
        return of(filtered).pipe(delay(200));
    }
}
