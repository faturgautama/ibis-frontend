import { Observable } from 'rxjs';

/**
 * DataProvider Abstract Class
 * 
 * Provides a consistent interface for both API and Demo services.
 * All data services should extend this class to ensure consistent CRUD operations.
 * 
 * @template T - The type of entity this provider manages
 */
export abstract class DataProvider<T> {

    /**
     * Retrieve all entities
     * @returns Observable of array of entities
     */
    abstract getAll(): Observable<T[]>;

    /**
     * Retrieve a single entity by ID
     * @param id - The unique identifier of the entity
     * @returns Observable of the entity
     */
    abstract getById(id: string): Observable<T>;

    /**
     * Create a new entity
     * @param item - The entity to create
     * @returns Observable of the created entity
     */
    abstract create(item: T): Observable<T>;

    /**
     * Update an existing entity
     * @param id - The unique identifier of the entity to update
     * @param item - The updated entity data
     * @returns Observable of the updated entity
     */
    abstract update(id: string, item: T): Observable<T>;

    /**
     * Delete an entity
     * @param id - The unique identifier of the entity to delete
     * @returns Observable of void
     */
    abstract delete(id: string): Observable<void>;
}
