import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BereitschaftszeitenDetailsComponent } from './bereitschaftszeiten-details.component';

describe('BereitschaftszeitenDetailsComponent', () => {
  let component: BereitschaftszeitenDetailsComponent;
  let fixture: ComponentFixture<BereitschaftszeitenDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BereitschaftszeitenDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BereitschaftszeitenDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
