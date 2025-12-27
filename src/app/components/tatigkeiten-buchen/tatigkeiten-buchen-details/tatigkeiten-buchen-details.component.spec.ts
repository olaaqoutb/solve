import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TatigkeitenBuchenDetailsComponent } from './tatigkeiten-buchen-details.component';

describe('TatigkeitenBuchenDetailsComponent', () => {
  let component: TatigkeitenBuchenDetailsComponent;
  let fixture: ComponentFixture<TatigkeitenBuchenDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TatigkeitenBuchenDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TatigkeitenBuchenDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
