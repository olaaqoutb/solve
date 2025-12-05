import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NachverrechnungDetailsComponent } from './nachverrechnung-details.component';

describe('NachverrechnungDetailsComponent', () => {
  let component: NachverrechnungDetailsComponent;
  let fixture: ComponentFixture<NachverrechnungDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NachverrechnungDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NachverrechnungDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
