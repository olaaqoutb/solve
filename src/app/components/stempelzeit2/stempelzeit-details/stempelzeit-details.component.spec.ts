import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StempelzeitDetailsComponent } from './stempelzeit-details.component';

describe('StempelzeitDetailsComponent', () => {
  let component: StempelzeitDetailsComponent;
  let fixture: ComponentFixture<StempelzeitDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StempelzeitDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StempelzeitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
