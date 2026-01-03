import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { UserRole } from '../models/user.model';

/**
 * Property Tests for Authentication
 * 
 * Feature: kek-inventory-traceability
 * Property 1: Authentication Success for Valid Credentials
 * Property 2: Authentication Failure for Invalid Credentials
 * Property 3: Role-Based Feature Access
 * Validates: Requirements 1.1, 1.2, 1.4
 */
describe('AuthService - Property Tests', () => {
    let service: AuthService;
    let localStorage: LocalStorageService;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthService,
                LocalStorageService,
                {
                    provide: Router,
                    useValue: {
                        navigate: jasmine.createSpy('navigate')
                    }
                }
            ]
        });
        service = TestBed.inject(AuthService);
        localStorage = TestBed.inject(LocalStorageService);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        localStorage.clear();
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 1: Authentication Success for Valid Credentials
     * Validates: Requirements 1.1
     */
    it('should authenticate successfully with valid credentials', (done) => {
        const validCredentials = {
            email: 'admin@kek.com',
            password: 'admin123'
        };

        service.login(validCredentials).subscribe({
            next: (response) => {
                expect(response).toBeDefined();
                expect(response.user).toBeDefined();
                expect(response.token).toBeDefined();
                expect(response.user.email).toBe(validCredentials.email);
                expect(service.isAuthenticated()).toBe(true);
                done();
            },
            error: () => {
                fail('Should not fail with valid credentials');
                done();
            }
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 2: Authentication Failure for Invalid Credentials
     * Validates: Requirements 1.2
     */
    it('should fail authentication with invalid credentials', (done) => {
        const invalidCredentials = {
            email: 'invalid@kek.com',
            password: 'wrongpassword'
        };

        service.login(invalidCredentials).subscribe({
            next: () => {
                fail('Should not succeed with invalid credentials');
                done();
            },
            error: (error) => {
                expect(error).toBeDefined();
                expect(service.isAuthenticated()).toBe(false);
                done();
            }
        });
    });

    /**
     * Feature: kek-inventory-traceability
     * Property 3: Role-Based Feature Access
     * Validates: Requirements 1.4
     */
    it('should correctly identify user roles', (done) => {
        const adminCredentials = {
            email: 'admin@kek.com',
            password: 'admin123'
        };

        service.login(adminCredentials).subscribe({
            next: (response) => {
                expect(response.user.role).toBe(UserRole.ADMIN);
                expect(service.hasRole(UserRole.ADMIN)).toBe(true);
                expect(service.hasRole(UserRole.WAREHOUSE)).toBe(false);
                expect(service.hasAnyRole([UserRole.ADMIN, UserRole.WAREHOUSE])).toBe(true);
                done();
            }
        });
    });

    it('should maintain authentication state across page reloads', () => {
        // Simulate stored auth data
        const mockUser = {
            id: '1',
            name: 'Test User',
            email: 'test@kek.com',
            role: UserRole.ADMIN,
            active: true,
            created_at: new Date()
        };
        const mockToken = 'test_token_123';

        localStorage.setItem('current_user', mockUser);
        localStorage.setItem('auth_token', mockToken);

        // Create new service instance to simulate page reload
        const newService = new AuthService();

        expect(newService.isAuthenticated()).toBe(true);
        expect(newService.getToken()).toBe(mockToken);
    });

    it('should clear authentication state on logout', (done) => {
        const credentials = {
            email: 'admin@kek.com',
            password: 'admin123'
        };

        service.login(credentials).subscribe({
            next: () => {
                expect(service.isAuthenticated()).toBe(true);

                service.logout();

                expect(service.isAuthenticated()).toBe(false);
                expect(service.getToken()).toBeNull();
                expect(localStorage.getItem('current_user')).toBeNull();
                expect(localStorage.getItem('auth_token')).toBeNull();
                done();
            }
        });
    });
});
