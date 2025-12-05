import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaetigkeitenKorrigierenListComponent } from './taetigkeiten-korrigieren-list.component';

describe('TaetigkeitenKorrigierenListComponent', () => {
  let component: TaetigkeitenKorrigierenListComponent;
  let fixture: ComponentFixture<TaetigkeitenKorrigierenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaetigkeitenKorrigierenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaetigkeitenKorrigierenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
