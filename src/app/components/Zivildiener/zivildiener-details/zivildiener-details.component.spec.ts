import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZivildienerDetailsComponent } from './zivildiener-details.component';

describe('ZivildienerDetailsComponent', () => {
  let component: ZivildienerDetailsComponent;
  let fixture: ComponentFixture<ZivildienerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZivildienerDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZivildienerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
