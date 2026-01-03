import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Login Component
 * 
 * Provides login form for user authentication.
 */
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        CardModule,
        CheckboxModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private notificationService = inject(NotificationService);

    loginForm: FormGroup;
    loading = signal(false);
    showDemoCredentials = signal(true);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    /**
     * Handle form submission
     */
    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.markFormGroupTouched(this.loginForm);
            return;
        }

        this.loading.set(true);

        const credentials = {
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        };

        this.authService.login(credentials).subscribe({
            next: (response) => {
                this.notificationService.success(`Welcome back, ${response.user.name}!`);

                // Get return URL from query params or default to dashboard
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
                this.router.navigate([returnUrl]);
            },
            error: (error) => {
                this.loading.set(false);
                const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
                this.notificationService.error(errorMessage);
            }
        });
    }

    /**
     * Fill form with demo credentials
     */
    useDemoCredentials(role: 'admin' | 'warehouse' | 'production' | 'audit'): void {
        const credentials = {
            admin: { email: 'admin@kek.com', password: 'admin123' },
            warehouse: { email: 'warehouse@kek.com', password: 'warehouse123' },
            production: { email: 'production@kek.com', password: 'production123' },
            audit: { email: 'audit@kek.com', password: 'audit123' }
        };

        this.loginForm.patchValue(credentials[role]);
    }

    /**
     * Mark all form fields as touched to show validation errors
     */
    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    /**
     * Check if field has error
     */
    hasError(fieldName: string, errorType: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field?.hasError(errorType) && field?.touched);
    }
}
