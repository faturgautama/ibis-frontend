import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockOpnameFormComponent } from './stock-opname-form.component';

describe('StockOpnameFormComponent', () => {
    let component: StockOpnameFormComponent;
    let fixture: ComponentFixture<StockOpnameFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StockOpnameFormComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(StockOpnameFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
