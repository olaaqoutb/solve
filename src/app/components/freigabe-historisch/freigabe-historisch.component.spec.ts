import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreigabeHistorischComponent } from './freigabe-historisch.component';

describe('FreigabeHistorischComponent', () => {
  let component: FreigabeHistorischComponent;
  let fixture: ComponentFixture<FreigabeHistorischComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreigabeHistorischComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreigabeHistorischComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
