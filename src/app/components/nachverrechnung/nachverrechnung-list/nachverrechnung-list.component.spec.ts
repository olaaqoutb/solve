import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NachverrechnungListComponent } from './nachverrechnung-list.component';

describe('NachverrechnungListComponent', () => {
  let component: NachverrechnungListComponent;
  let fixture: ComponentFixture<NachverrechnungListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NachverrechnungListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NachverrechnungListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
