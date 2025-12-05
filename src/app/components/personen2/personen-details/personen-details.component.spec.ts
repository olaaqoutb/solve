import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonenDetailsComponent } from './personen-details.component';

describe('PersonenDetailsComponent', () => {
  let component: PersonenDetailsComponent;
  let fixture: ComponentFixture<PersonenDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonenDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonenDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
