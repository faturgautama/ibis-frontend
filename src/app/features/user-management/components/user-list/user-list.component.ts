import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService } from '../../services/user-management.service';
import { User, UserRole, UserStatus, validatePassword } from '../../models/user.model';

/**
 * User List Component
 * Requirements: 19.1, 19.2, 19.3
 */
@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        TagModule,
        DialogModule,
        InputTextModule,
        SelectModule
    ],
    template: `
        <div class="p-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
                    <button 
                        pButton 
                        label="Add User" 
                        icon="pi pi-plus"
                        (click)="showCreateDialog()"
                        class="p-button-primary"
                    ></button>
                </div>

                <p-table 
                    [value]="users" 
                    [paginator]="true" 
                    [rows]="10"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Department</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-user>
                        <tr>
                            <td>{{ user.username }}</td>
                            <td>{{ user.full_name }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <p-tag [value]="user.role" [severity]="getRoleSeverity(user.role)"></p-tag>
                            </td>
                            <td>
                                <p-tag [value]="user.status" [severity]="getStatusSeverity(user.status)"></p-tag>
                            </td>
                            <td>{{ user.department || '-' }}</td>
                            <td>{{ user.last_login ? (user.last_login | date:'short') : 'Never' }}</td>
                            <td>
                                <div class="flex gap-2">
                                    <button 
                                        pButton 
                                        icon="pi pi-pencil"
                                        class="p-button-sm p-button-text"
                                        (click)="showEditDialog(user)"
                                        pTooltip="Edit"
                                    ></button>
                                    <button 
                                        pButton 
                                        icon="pi pi-history"
                                        class="p-button-sm p-button-text"
                                        (click)="showActivityDialog(user)"
                                        pTooltip="Activity Log"
                                    ></button>
                                    <button 
                                        pButton 
                                        icon="pi pi-trash"
                                        class="p-button-sm p-button-text p-button-danger"
                                        (click)="deleteUser(user)"
                                        pTooltip="Delete"
                                    ></button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Create/Edit User Dialog -->
        <p-dialog 
            [(visible)]="displayDialog" 
            [header]="isEditMode ? 'Edit User' : 'Create User'"
            [modal]="true"
            [style]="{width: '500px'}"
        >
            <form [formGroup]="userForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input 
                        pInputText 
                        formControlName="username"
                        class="w-full"
                        [disabled]="isEditMode"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input 
                        pInputText 
                        formControlName="full_name"
                        class="w-full"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input 
                        pInputText 
                        type="email"
                        formControlName="email"
                        class="w-full"
                    />
                </div>

                <div *ngIf="!isEditMode">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input 
                        pInputText 
                        type="password"
                        formControlName="password"
                        class="w-full"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        Min 8 chars, uppercase, lowercase, number, special char
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <p-select 
                        formControlName="role"
                        [options]="roleOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    ></p-select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <p-select 
                        formControlName="status"
                        [options]="statusOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    ></p-select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input 
                        pInputText 
                        formControlName="phone"
                        class="w-full"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input 
                        pInputText 
                        formControlName="department"
                        class="w-full"
                    />
                </div>
            </form>

            <ng-template pTemplate="footer">
                <button 
                    pButton 
                    label="Cancel" 
                    icon="pi pi-times"
                    (click)="displayDialog = false"
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    [label]="isEditMode ? 'Update' : 'Create'" 
                    icon="pi pi-check"
                    (click)="saveUser()"
                    [disabled]="!userForm.valid"
                    class="p-button-primary"
                ></button>
            </ng-template>
        </p-dialog>

        <!-- Activity Log Dialog -->
        <p-dialog 
            [(visible)]="displayActivityDialog" 
            header="User Activity Log"
            [modal]="true"
            [style]="{width: '700px'}"
        >
            <p-table [value]="userActivities" [paginator]="true" [rows]="10">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Timestamp</th>
                        <th>Action</th>
                        <th>Entity</th>
                        <th>Details</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-activity>
                    <tr>
                        <td>{{ activity.timestamp | date:'short' }}</td>
                        <td>{{ activity.action }}</td>
                        <td>{{ activity.entity_type || '-' }}</td>
                        <td>{{ activity.details ? (activity.details | json) : '-' }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-dialog>
    `
})
export class UserListComponent implements OnInit {
    private userService = inject(UserManagementService);
    private fb = inject(FormBuilder);

    users: User[] = [];
    userActivities: any[] = [];
    displayDialog = false;
    displayActivityDialog = false;
    isEditMode = false;
    selectedUser: User | null = null;

    userForm: FormGroup;

    roleOptions = [
        { label: 'Admin', value: UserRole.ADMIN },
        { label: 'Warehouse', value: UserRole.WAREHOUSE },
        { label: 'Production', value: UserRole.PRODUCTION },
        { label: 'Audit', value: UserRole.AUDIT }
    ];

    statusOptions = [
        { label: 'Active', value: UserStatus.ACTIVE },
        { label: 'Inactive', value: UserStatus.INACTIVE },
        { label: 'Suspended', value: UserStatus.SUSPENDED }
    ];

    constructor() {
        this.userForm = this.fb.group({
            username: ['', Validators.required],
            full_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''],
            role: [UserRole.WAREHOUSE, Validators.required],
            status: [UserStatus.ACTIVE, Validators.required],
            phone: [''],
            department: ['']
        });
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.userService.getAllUsers().subscribe(users => {
            this.users = users;
        });
    }

    showCreateDialog(): void {
        this.isEditMode = false;
        this.selectedUser = null;
        this.userForm.reset({
            role: UserRole.WAREHOUSE,
            status: UserStatus.ACTIVE
        });
        this.userForm.get('password')?.setValidators([Validators.required]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.displayDialog = true;
    }

    showEditDialog(user: User): void {
        this.isEditMode = true;
        this.selectedUser = user;
        this.userForm.patchValue(user);
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.displayDialog = true;
    }

    saveUser(): void {
        if (!this.userForm.valid) return;

        const formValue = this.userForm.value;

        if (this.isEditMode && this.selectedUser) {
            this.userService.updateUser(this.selectedUser.id, formValue, 'current_user').subscribe({
                next: () => {
                    this.loadUsers();
                    this.displayDialog = false;
                },
                error: (err) => console.error('Update failed:', err)
            });
        } else {
            this.userService.createUser(formValue, formValue.password, 'current_user').subscribe({
                next: () => {
                    this.loadUsers();
                    this.displayDialog = false;
                },
                error: (err) => console.error('Create failed:', err)
            });
        }
    }

    deleteUser(user: User): void {
        if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
            this.userService.deleteUser(user.id, 'current_user').subscribe({
                next: () => this.loadUsers(),
                error: (err) => console.error('Delete failed:', err)
            });
        }
    }

    showActivityDialog(user: User): void {
        this.userService.getUserActivities(user.id, 50).subscribe(activities => {
            this.userActivities = activities;
            this.displayActivityDialog = true;
        });
    }

    getRoleSeverity(role: UserRole): any {
        const map: Record<UserRole, string> = {
            [UserRole.ADMIN]: 'danger',
            [UserRole.WAREHOUSE]: 'info',
            [UserRole.PRODUCTION]: 'success',
            [UserRole.AUDIT]: 'warning'
        };
        return map[role] || 'info';
    }

    getStatusSeverity(status: UserStatus): any {
        const map: Record<UserStatus, string> = {
            [UserStatus.ACTIVE]: 'success',
            [UserStatus.INACTIVE]: 'secondary',
            [UserStatus.SUSPENDED]: 'danger'
        };
        return map[status] || 'info';
    }
}
