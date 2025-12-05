import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonenDetailComponent } from './personen-detail.component';

describe('PersonenDetailComponent', () => {
  let component: PersonenDetailComponent;
  let fixture: ComponentFixture<PersonenDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonenDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonenDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
