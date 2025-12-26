import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TatigkeitenKorrigierenDetailsComponent } from './tatigkeiten-korrigieren-details.component';

describe('TatigkeitenKorrigierenDetailsComponent', () => {
  let component: TatigkeitenKorrigierenDetailsComponent;
  let fixture: ComponentFixture<TatigkeitenKorrigierenDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TatigkeitenKorrigierenDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TatigkeitenKorrigierenDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
