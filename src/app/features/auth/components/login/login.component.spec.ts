import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserRole } from '../../models/user.model';

/**
 * Unit Tests for Login Component
 * 
 * Tests login form validation, submission, and demo credentials functionality.
 * Validates: Requirements 1.1, 1.2
 */
describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
        const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            queryParams: {}
                        }
                    }
                }
            ]
        }).compileComponents();

        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with empty form', () => {
        expect(component.loginForm.value).toEqual({
            email: '',
            password: '',
            rememberMe: false
        });
    });

    it('should validate email field', () => {
        const emailControl = component.loginForm.get('email');

        // Empty email
        emailControl?.setValue('');
        expect(emailControl?.hasError('required')).toBe(true);

        // Invalid email format
        emailControl?.setValue('invalid-email');
        expect(emailControl?.hasError('email')).toBe(true);

        // Valid email
        emailControl?.setValue('test@kek.com');
        expect(emailControl?.valid).toBe(true);
    });

    it('should validate password field', () => {
        const passwordControl = component.loginForm.get('password');

        // Empty password
        passwordControl?.setValue('');
        expect(passwordControl?.hasError('required')).toBe(true);

        // Password too short
        passwordControl?.setValue('12345');
        expect(passwordControl?.hasError('minlength')).toBe(true);

        // Valid password
        passwordControl?.setValue('123456');
        expect(passwordControl?.valid).toBe(true);
    });

    it('should not submit invalid form', () => {
        component.onSubmit();
        expect(authService.login).not.toHaveBeenCalled();
    });

    it('should submit valid form and navigate on success', () => {
        const mockResponse = {
            user: {
                id: '1',
                name: 'Test User',
                email: 'test@kek.com',
                role: UserRole.ADMIN,
                active: true,
                created_at: new Date()
            },
            token: 'test_token',
            expiresIn: 1800
        };

        authService.login.and.returnValue(of(mockResponse));

        component.loginForm.patchValue({
            email: 'test@kek.com',
            password: '123456'
        });

        component.onSubmit();

        expect(authService.login).toHaveBeenCalledWith({
            email: 'test@kek.com',
            password: '123456'
        });
        expect(notificationService.success).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error message on login failure', () => {
        const mockError = {
            error: { message: 'Invalid credentials' }
        };

        authService.login.and.returnValue(throwError(() => mockError));

        component.loginForm.patchValue({
            email: 'test@kek.com',
            password: 'wrongpassword'
        });

        component.onSubmit();

        expect(authService.login).toHaveBeenCalled();
        expect(notificationService.error).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should fill form with demo credentials', () => {
        component.useDemoCredentials('admin');

        expect(component.loginForm.value.email).toBe('admin@kek.com');
        expect(component.loginForm.value.password).toBe('admin123');
    });

    it('should fill form with different role credentials', () => {
        component.useDemoCredentials('warehouse');
        expect(component.loginForm.value.email).toBe('warehouse@kek.com');

        component.useDemoCredentials('production');
        expect(component.loginForm.value.email).toBe('production@kek.com');

        component.useDemoCredentials('audit');
        expect(component.loginForm.value.email).toBe('audit@kek.com');
    });
});
