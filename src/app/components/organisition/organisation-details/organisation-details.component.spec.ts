import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationdetailsComponent } from './organisation-details.component';

describe('OrganizationdetailsComponent', () => {
  let component: OrganizationdetailsComponent;
  let fixture: ComponentFixture<OrganizationdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationdetailsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrganizationdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
