import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaetigkeitenKorrigierenDetailComponent } from './taetigkeiten-korrigieren-detail.component';

describe('TaetigkeitenKorrigierenDetailComponent', () => {
  let component: TaetigkeitenKorrigierenDetailComponent;
  let fixture: ComponentFixture<TaetigkeitenKorrigierenDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaetigkeitenKorrigierenDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaetigkeitenKorrigierenDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
