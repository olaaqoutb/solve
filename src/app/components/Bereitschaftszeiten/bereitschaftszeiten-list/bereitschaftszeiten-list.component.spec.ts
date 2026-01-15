import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BereitschaftszeitenListComponent } from './bereitschaftszeiten-list.component';

describe('BereitschaftszeitenListComponent', () => {
  let component: BereitschaftszeitenListComponent;
  let fixture: ComponentFixture<BereitschaftszeitenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BereitschaftszeitenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BereitschaftszeitenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
