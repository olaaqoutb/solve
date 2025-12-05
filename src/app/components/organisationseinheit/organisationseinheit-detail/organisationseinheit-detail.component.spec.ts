import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationseinheitDetailComponent } from './organisationseinheit-detail.component';

describe('OrganisationseinheitDetailComponent', () => {
  let component: OrganisationseinheitDetailComponent;
  let fixture: ComponentFixture<OrganisationseinheitDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationseinheitDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationseinheitDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
