import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZivildienerListComponent } from './zivildiener-list.component';

describe('ZivildienerListComponent', () => {
  let component: ZivildienerListComponent;
  let fixture: ComponentFixture<ZivildienerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZivildienerListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZivildienerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
