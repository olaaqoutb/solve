import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonenListComponent } from './personen-list.component';

describe('PersonenListComponent', () => {
  let component: PersonenListComponent;
  let fixture: ComponentFixture<PersonenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
