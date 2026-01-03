/**
 * User Management Models
 * Requirements: 19.1-19.8
 */

export enum UserRole {
    ADMIN = 'ADMIN',
    WAREHOUSE = 'WAREHOUSE',
    PRODUCTION = 'PRODUCTION',
    AUDIT = 'AUDIT'
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export interface User {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: UserRole;
    status: UserStatus;
    phone?: string;
    department?: string;
    last_login?: Date;
    created_at: Date;
    created_by: string;
    updated_at?: Date;
    updated_by?: string;
}

export interface UserActivity {
    id: string;
    user_id: string;
    username: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    ip_address?: string;
    user_agent?: string;
    timestamp: Date;
    details?: any;
}

export interface PasswordChangeRequest {
    user_id: string;
    old_password: string;
    new_password: string;
    confirm_password: string;
}

export interface PasswordResetRequest {
    email: string;
    reset_token?: string;
    new_password?: string;
}

export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
};

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
