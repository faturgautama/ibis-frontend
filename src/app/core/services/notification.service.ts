import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * NotificationService
 * 
 * Service for displaying toast notifications using PrimeNG Toast component.
 * Provides methods for success, error, warning, and info messages.
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private messageService: MessageService) { }

    /**
     * Display a success notification
     * @param message - The message to display
     * @param title - Optional title (defaults to 'Success')
     * @param life - Duration in milliseconds (defaults to 3000)
     */
    success(message: string, title: string = 'Success', life: number = 3000): void {
        this.messageService.add({
            severity: 'success',
            summary: title,
            detail: message,
            life
        });
    }

    /**
     * Display an error notification
     * @param message - The message to display
     * @param title - Optional title (defaults to 'Error')
     * @param life - Duration in milliseconds (defaults to 5000)
     */
    error(message: string, title: string = 'Error', life: number = 5000): void {
        this.messageService.add({
            severity: 'error',
            summary: title,
            detail: message,
            life
        });
    }

    /**
     * Display a warning notification
     * @param message - The message to display
     * @param title - Optional title (defaults to 'Warning')
     * @param life - Duration in milliseconds (defaults to 4000)
     */
    warning(message: string, title: string = 'Warning', life: number = 4000): void {
        this.messageService.add({
            severity: 'warn',
            summary: title,
            detail: message,
            life
        });
    }

    /**
     * Display an info notification
     * @param message - The message to display
     * @param title - Optional title (defaults to 'Info')
     * @param life - Duration in milliseconds (defaults to 3000)
     */
    info(message: string, title: string = 'Info', life: number = 3000): void {
        this.messageService.add({
            severity: 'info',
            summary: title,
            detail: message,
            life
        });
    }

    /**
     * Clear all notifications
     */
    clear(): void {
        this.messageService.clear();
    }
}
