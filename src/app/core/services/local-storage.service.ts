import { Injectable } from '@angular/core';

/**
 * LocalStorageService
 * 
 * Wrapper service for localStorage operations with type safety.
 * Provides methods to store, retrieve, and manage data in browser's localStorage.
 */
@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    /**
     * Store an item in localStorage
     * @param key - The key to store the item under
     * @param value - The value to store (will be JSON stringified)
     */
    setItem<T>(key: string, value: T): void {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        } catch (error) {
            console.error(`Error saving to localStorage (key: ${key}):`, error);
            throw new Error(`Failed to save data to localStorage: ${error}`);
        }
    }

    /**
     * Retrieve an item from localStorage
     * @param key - The key to retrieve
     * @returns The parsed value or null if not found
     */
    getItem<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return null;
            }
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error reading from localStorage (key: ${key}):`, error);
            return null;
        }
    }

    /**
     * Remove an item from localStorage
     * @param key - The key to remove
     */
    removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage (key: ${key}):`, error);
        }
    }

    /**
     * Clear all items from localStorage
     */
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    /**
     * Check if a key exists in localStorage
     * @param key - The key to check
     * @returns true if the key exists, false otherwise
     */
    hasItem(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }

    /**
     * Get all keys in localStorage
     * @returns Array of all keys
     */
    getAllKeys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                keys.push(key);
            }
        }
        return keys;
    }
}
