import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TatigkeitenBuchenListComponent } from './tatigkeiten-buchen-list.component';

describe('TatigkeitenBuchenListComponent', () => {
  let component: TatigkeitenBuchenListComponent;
  let fixture: ComponentFixture<TatigkeitenBuchenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TatigkeitenBuchenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TatigkeitenBuchenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
