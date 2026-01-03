import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ItemFormComponent } from './item-form.component';
import { InventoryActions } from '../../../../store/inventory/inventory.actions';
import { Item, ItemType, FacilityStatus } from '../../models/item.model';

/**
 * Unit Tests for Item Form Component
 * 
 * Requirements: 2.2, 2.3, 2.7, 2.8
 */
describe('ItemFormComponent', () => {
    let component: ItemFormComponent;
    let fixture: ComponentFixture<ItemFormComponent>;
    let store: MockStore;
    let router: Router;

    const mockItem: Item = {
        id: '1',
        item_code: 'RM-001',
        item_name: 'Steel Plate',
        hs_code: '7208390000',
        item_type: ItemType.RAW,
        unit: 'kg',
        is_hazardous: false,
        facility_status: FacilityStatus.FASILITAS,
        active: true,
        description: 'Test description',
        brand: 'Test Brand',
        min_stock: 100,
        max_stock: 1000,
        price: 15000,
        currency: 'IDR',
        created_at: new Date(),
        updated_at: new Date()
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ItemFormComponent],
            providers: [
                provideMockStore({
                    initialState: {
                        inventory: {
                            items: [],
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
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => null
                            }
                        }
                    }
                }
            ]
        }).compileComponents();

        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);

        fixture = TestBed.createComponent(ItemFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize form with default values', () => {
            expect(component.itemForm).toBeDefined();
            expect(component.itemForm.get('item_code')?.value).toBe('');
            expect(component.itemForm.get('item_name')?.value).toBe('');
            expect(component.itemForm.get('is_hazardous')?.value).toBe(false);
            expect(component.itemForm.get('active')?.value).toBe(true);
            expect(component.itemForm.get('facility_status')?.value).toBe(FacilityStatus.FASILITAS);
            expect(component.itemForm.get('currency')?.value).toBe('IDR');
        });

        it('should set isEditMode to false for new item', () => {
            expect(component.isEditMode).toBe(false);
        });
    });

    describe('Form Validation', () => {
        it('should require item_code', () => {
            const control = component.itemForm.get('item_code');
            control?.setValue('');
            expect(control?.hasError('required')).toBe(true);

            control?.setValue('RM-001');
            expect(control?.hasError('required')).toBe(false);
        });

        it('should require item_name', () => {
            const control = component.itemForm.get('item_name');
            control?.setValue('');
            expect(control?.hasError('required')).toBe(true);

            control?.setValue('Test Item');
            expect(control?.hasError('required')).toBe(false);
        });

        it('should require hs_code', () => {
            const control = component.itemForm.get('hs_code');
            control?.setValue('');
            expect(control?.hasError('required')).toBe(true);
        });

        it('should validate hs_code format (10 digits)', () => {
            const control = component.itemForm.get('hs_code');

            // Invalid: too short
            control?.setValue('123');
            expect(control?.hasError('pattern')).toBe(true);

            // Invalid: too long
            control?.setValue('12345678901');
            expect(control?.hasError('pattern')).toBe(true);

            // Invalid: contains letters
            control?.setValue('12345678AB');
            expect(control?.hasError('pattern')).toBe(true);

            // Valid: exactly 10 digits
            control?.setValue('1234567890');
            expect(control?.hasError('pattern')).toBe(false);
        });

        it('should require item_type', () => {
            const control = component.itemForm.get('item_type');
            control?.setValue(null);
            expect(control?.hasError('required')).toBe(true);

            control?.setValue(ItemType.RAW);
            expect(control?.hasError('required')).toBe(false);
        });

        it('should require unit', () => {
            const control = component.itemForm.get('unit');
            control?.setValue('');
            expect(control?.hasError('required')).toBe(true);

            control?.setValue('kg');
            expect(control?.hasError('required')).toBe(false);
        });

        it('should mark form as invalid when required fields are missing', () => {
            expect(component.itemForm.valid).toBe(false);
        });

        it('should mark form as valid when all required fields are filled', () => {
            component.itemForm.patchValue({
                item_code: 'RM-001',
                item_name: 'Test Item',
                hs_code: '1234567890',
                item_type: ItemType.RAW,
                unit: 'kg'
            });

            expect(component.itemForm.valid).toBe(true);
        });
    });

    describe('Form Submission - Create Mode', () => {
        beforeEach(() => {
            component.isEditMode = false;
            component.itemForm.patchValue({
                item_code: 'RM-001',
                item_name: 'Test Item',
                hs_code: '1234567890',
                item_type: ItemType.RAW,
                unit: 'kg',
                is_hazardous: false,
                facility_status: FacilityStatus.FASILITAS,
                active: true
            });
        });

        it('should dispatch createItem action on submit', () => {
            spyOn(store, 'dispatch');
            component.onSubmit();

            expect(store.dispatch).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    type: InventoryActions.createItem.type
                })
            );
        });

        it('should not submit if form is invalid', () => {
            spyOn(store, 'dispatch');
            component.itemForm.patchValue({ item_code: '' }); // Make form invalid
            component.onSubmit();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should mark all fields as touched on invalid submit', () => {
            component.itemForm.patchValue({ item_code: '' }); // Make form invalid
            component.onSubmit();

            Object.keys(component.itemForm.controls).forEach(key => {
                expect(component.itemForm.get(key)?.touched).toBe(true);
            });
        });
    });

    describe('Form Submission - Edit Mode', () => {
        beforeEach(() => {
            component.isEditMode = true;
            component.itemId = '1';
            component.itemForm.patchValue({
                item_code: 'RM-001',
                item_name: 'Updated Item',
                hs_code: '1234567890',
                item_type: ItemType.RAW,
                unit: 'kg',
                is_hazardous: false,
                facility_status: FacilityStatus.FASILITAS,
                active: true
            });
        });

        it('should dispatch updateItem action on submit', () => {
            spyOn(store, 'dispatch');
            component.onSubmit();

            expect(store.dispatch).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    type: InventoryActions.updateItem.type
                })
            );
        });
    });

    describe('Navigation', () => {
        it('should navigate back to list on cancel', () => {
            component.onCancel();
            expect(router.navigate).toHaveBeenCalledWith(['/inventory/items']);
        });

        it('should navigate back to list after successful submit', (done) => {
            component.itemForm.patchValue({
                item_code: 'RM-001',
                item_name: 'Test Item',
                hs_code: '1234567890',
                item_type: ItemType.RAW,
                unit: 'kg'
            });

            component.onSubmit();

            setTimeout(() => {
                expect(router.navigate).toHaveBeenCalledWith(['/inventory/items']);
                done();
            }, 600);
        });
    });

    describe('Image Upload', () => {
        it('should handle image upload', () => {
            const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
            const mockEvent = {
                files: [mockFile]
            };

            // Mock FileReader
            const mockReader = {
                onload: null as any,
                readAsDataURL: jasmine.createSpy('readAsDataURL').and.callFake(function (this: any) {
                    if (this.onload) {
                        this.onload({ target: { result: 'data:image/jpeg;base64,test' } });
                    }
                })
            };

            spyOn(window as any, 'FileReader').and.returnValue(mockReader);

            component.onImageUpload(mockEvent);

            expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
        });

        it('should update form with image URL', () => {
            const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
            const mockEvent = {
                files: [mockFile]
            };

            const mockDataUrl = 'data:image/jpeg;base64,test';
            const mockReader = {
                onload: null as any,
                readAsDataURL: jasmine.createSpy('readAsDataURL').and.callFake(function (this: any) {
                    if (this.onload) {
                        this.onload({ target: { result: mockDataUrl } });
                    }
                })
            };

            spyOn(window as any, 'FileReader').and.returnValue(mockReader);

            component.onImageUpload(mockEvent);

            expect(component.itemForm.get('image_url')?.value).toBe(mockDataUrl);
        });
    });

    describe('Hazardous Item Handling', () => {
        it('should handle hazardous flag', () => {
            component.itemForm.patchValue({ is_hazardous: true });
            expect(component.itemForm.get('is_hazardous')?.value).toBe(true);
        });

        it('should default to non-hazardous', () => {
            expect(component.itemForm.get('is_hazardous')?.value).toBe(false);
        });
    });

    describe('Dropdown Options', () => {
        it('should have item type options', () => {
            expect(component.itemTypeOptions.length).toBe(4);
            expect(component.itemTypeOptions).toContain(
                jasmine.objectContaining({ value: ItemType.RAW })
            );
            expect(component.itemTypeOptions).toContain(
                jasmine.objectContaining({ value: ItemType.WIP })
            );
            expect(component.itemTypeOptions).toContain(
                jasmine.objectContaining({ value: ItemType.FG })
            );
            expect(component.itemTypeOptions).toContain(
                jasmine.objectContaining({ value: ItemType.ASSET })
            );
        });

        it('should have unit options', () => {
            expect(component.unitOptions.length).toBe(5);
            expect(component.unitOptions).toContain(
                jasmine.objectContaining({ value: 'pcs' })
            );
            expect(component.unitOptions).toContain(
                jasmine.objectContaining({ value: 'kg' })
            );
        });

        it('should have facility status options', () => {
            expect(component.facilityStatusOptions.length).toBe(2);
            expect(component.facilityStatusOptions).toContain(
                jasmine.objectContaining({ value: FacilityStatus.FASILITAS })
            );
            expect(component.facilityStatusOptions).toContain(
                jasmine.objectContaining({ value: FacilityStatus.NON })
            );
        });

        it('should have currency options', () => {
            expect(component.currencyOptions.length).toBeGreaterThan(0);
            expect(component.currencyOptions).toContain(
                jasmine.objectContaining({ value: 'IDR' })
            );
        });
    });
});
