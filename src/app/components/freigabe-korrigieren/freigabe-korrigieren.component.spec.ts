import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreigabeKorrigierenComponent } from './freigabe-korrigieren.component';

describe('FreigabeKorrigierenComponent', () => {
  let component: FreigabeKorrigierenComponent;
  let fixture: ComponentFixture<FreigabeKorrigierenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreigabeKorrigierenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreigabeKorrigierenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
