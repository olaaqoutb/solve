import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreigabeComponent } from './freigabe.component';

describe('FreigabeComponent', () => {
  let component: FreigabeComponent;
  let fixture: ComponentFixture<FreigabeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreigabeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreigabeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
