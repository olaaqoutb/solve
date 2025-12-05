import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StempelzeitListComponent } from './stempelzeit-list.component';

describe('StempelzeitListComponent', () => {
  let component: StempelzeitListComponent;
  let fixture: ComponentFixture<StempelzeitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StempelzeitListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StempelzeitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
