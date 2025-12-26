import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TatigkeitenKorrigierenListComponent } from './tatigkeiten-korrigieren-list.component';

describe('TatigkeitenKorrigierenListComponent', () => {
  let component: TatigkeitenKorrigierenListComponent;
  let fixture: ComponentFixture<TatigkeitenKorrigierenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TatigkeitenKorrigierenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TatigkeitenKorrigierenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
