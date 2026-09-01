import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodShopsComponent } from './food-shops.component';

describe('FoodShopsComponent', () => {
  let component: FoodShopsComponent;
  let fixture: ComponentFixture<FoodShopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodShopsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodShopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
