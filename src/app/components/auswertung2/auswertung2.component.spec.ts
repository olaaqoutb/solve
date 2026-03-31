import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auswertung2Component } from './auswertung2.component';

describe('Auswertung2Component', () => {
  let component: Auswertung2Component;
  let fixture: ComponentFixture<Auswertung2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auswertung2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Auswertung2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
