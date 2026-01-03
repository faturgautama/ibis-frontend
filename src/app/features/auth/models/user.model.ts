/**
 * User Role Enum
 * 
 * Defines the different roles available in the system.
 * Each role has different permissions and access levels.
 */
export enum UserRole {
    ADMIN = 'admin',
    WAREHOUSE = 'warehouse',
    PRODUCTION = 'production',
    AUDIT = 'audit'
}

/**
 * User Model
 * 
 * Represents a user in the system with authentication and profile information.
 */
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    created_at: Date;
    updated_at?: Date;
    last_login?: Date;
}

/**
 * Login Credentials
 * 
 * Credentials required for user authentication.
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Auth Response
 * 
 * Response returned after successful authentication.
 */
export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
    expiresIn: number; // Token expiration time in seconds
}

/**
 * Password Change Request
 * 
 * Data required to change user password.
 */
export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Password Reset Request
 * 
 * Data required to reset user password.
 */
export interface PasswordResetRequest {
    email: string;
}
