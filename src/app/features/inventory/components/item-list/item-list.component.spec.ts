import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

import { ItemListComponent } from './item-list.component';
import { InventoryActions } from '../../../../store/inventory/inventory.actions';
import { Item, ItemType, FacilityStatus } from '../../models/item.model';

/**
 * Unit Tests for Item List Component
 * 
 * Requirements: 2.1, 2.2, 7.8
 */
describe('ItemListComponent', () => {
    let component: ItemListComponent;
    let fixture: ComponentFixture<ItemListComponent>;
    let store: MockStore;
    let router: Router;
    let confirmationService: ConfirmationService;

    const mockItems: Item[] = [
        {
            id: '1',
            item_code: 'RM-001',
            item_name: 'Steel Plate',
            hs_code: '7208390000',
            item_type: ItemType.RAW,
            unit: 'kg',
            is_hazardous: false,
            facility_status: FacilityStatus.FASILITAS,
            active: true,
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: '2',
            item_code: 'RM-002',
            item_name: 'Industrial Paint',
            hs_code: '3208100000',
            item_type: ItemType.RAW,
            unit: 'liter',
            is_hazardous: true,
            facility_status: FacilityStatus.FASILITAS,
            active: true,
            created_at: new Date(),
            updated_at: new Date()
        }
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ItemListComponent],
            providers: [
                provideMockStore({
                    initialState: {
                        inventory: {
                            items: mockItems,
                            selectedItem: null,
                            loading: false,
                            error: null,
                            filters: {}
                        }
                    }
                }),
                {
                    provide: Router,
                    useValue: {
                        navigate: jasmine.createSpy('navigate')
                    }
                },
                ConfirmationService
            ]
        }).compileComponents();

        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);
        confirmationService = TestBed.inject(ConfirmationService);

        fixture = TestBed.createComponent(ItemListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Component Initialization', () => {
        it('should dispatch loadItems action on init', () => {
            spyOn(store, 'dispatch');
            component.ngOnInit();
            expect(store.dispatch).toHaveBeenCalledWith(InventoryActions.loadItems());
        });

        it('should initialize with empty search query', () => {
            expect(component.searchQuery).toBe('');
        });

        it('should initialize with null filters', () => {
            expect(component.selectedItemType).toBeNull();
            expect(component.selectedHazardous).toBeNull();
        });
    });

    describe('Item List Rendering', () => {
        it('should display items from store', (done) => {
            component.items$.subscribe(items => {
                expect(items.length).toBe(2);
                expect(items[0].item_code).toBe('RM-001');
                done();
            });
        });

        it('should show loading state', (done) => {
            store.setState({
                inventory: {
                    items: [],
                    selectedItem: null,
                    loading: true,
                    error: null,
                    filters: {}
                }
            });

            component.loading$.subscribe(loading => {
                expect(loading).toBe(true);
                done();
            });
        });

        it('should show error message', (done) => {
            const errorMessage = 'Failed to load items';
            store.setState({
                inventory: {
                    items: [],
                    selectedItem: null,
                    loading: false,
                    error: errorMessage,
                    filters: {}
                }
            });

            component.error$.subscribe(error => {
                expect(error).toBe(errorMessage);
                done();
            });
        });
    });

    describe('Search Functionality', () => {
        it('should dispatch setFilters action on search change', () => {
            spyOn(store, 'dispatch');
            component.searchQuery = 'steel';
            component.onSearchChange();

            expect(store.dispatch).toHaveBeenCalledWith(
                InventoryActions.setFilters({
                    filters: { searchQuery: 'steel' }
                })
            );
        });

        it('should update search query', () => {
            component.searchQuery = 'test query';
            expect(component.searchQuery).toBe('test query');
        });
    });

    describe('Filter Functionality', () => {
        it('should dispatch setFilters action on filter change', () => {
            spyOn(store, 'dispatch');
            component.selectedItemType = ItemType.RAW;
            component.selectedHazardous = true;
            component.onFilterChange();

            expect(store.dispatch).toHaveBeenCalledWith(
                InventoryActions.setFilters({
                    filters: {
                        itemType: ItemType.RAW,
                        isHazardous: true
                    }
                })
            );
        });

        it('should handle null filter values', () => {
            spyOn(store, 'dispatch');
            component.selectedItemType = null;
            component.selectedHazardous = null;
            component.onFilterChange();

            expect(store.dispatch).toHaveBeenCalledWith(
                InventoryActions.setFilters({
                    filters: {
                        itemType: undefined,
                        isHazardous: undefined
                    }
                })
            );
        });
    });

    describe('CRUD Operations', () => {
        it('should navigate to create item page', () => {
            component.onCreateItem();
            expect(router.navigate).toHaveBeenCalledWith(['/inventory/items/new']);
        });

        it('should navigate to edit item page', () => {
            const item = mockItems[0];
            component.onEditItem(item);
            expect(router.navigate).toHaveBeenCalledWith(['/inventory/items', item.id, 'edit']);
        });

        it('should show confirmation dialog on delete', () => {
            spyOn(confirmationService, 'confirm');
            const item = mockItems[0];
            component.onDeleteItem(item);

            expect(confirmationService.confirm).toHaveBeenCalled();
        });

        it('should dispatch deleteItem action on delete confirmation', () => {
            spyOn(store, 'dispatch');
            spyOn(confirmationService, 'confirm').and.callFake((config: any) => {
                config.accept();
            });

            const item = mockItems[0];
            component.onDeleteItem(item);

            expect(store.dispatch).toHaveBeenCalledWith(
                InventoryActions.deleteItem({ id: item.id })
            );
        });
    });

    describe('Item Type Severity', () => {
        it('should return correct severity for RAW type', () => {
            expect(component.getItemTypeSeverity(ItemType.RAW)).toBe('info');
        });

        it('should return correct severity for WIP type', () => {
            expect(component.getItemTypeSeverity(ItemType.WIP)).toBe('warning');
        });

        it('should return correct severity for FG type', () => {
            expect(component.getItemTypeSeverity(ItemType.FG)).toBe('success');
        });

        it('should return correct severity for ASSET type', () => {
            expect(component.getItemTypeSeverity(ItemType.ASSET)).toBe('danger');
        });
    });

    describe('Hazardous Item Display', () => {
        it('should identify hazardous items', (done) => {
            component.items$.subscribe(items => {
                const hazardousItem = items.find(i => i.is_hazardous);
                expect(hazardousItem).toBeDefined();
                expect(hazardousItem?.item_name).toBe('Industrial Paint');
                done();
            });
        });

        it('should identify non-hazardous items', (done) => {
            component.items$.subscribe(items => {
                const nonHazardousItem = items.find(i => !i.is_hazardous);
                expect(nonHazardousItem).toBeDefined();
                expect(nonHazardousItem?.item_name).toBe('Steel Plate');
                done();
            });
        });
    });
});
