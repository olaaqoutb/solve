import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationseinheitListComponent } from './organisationseinheit-list.component';

describe('OrganisationseinheitListComponent', () => {
  let component: OrganisationseinheitListComponent;
  let fixture: ComponentFixture<OrganisationseinheitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationseinheitListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationseinheitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
