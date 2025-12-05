import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VertrageDetailsComponent } from './vertrage-details.component';

describe('VertrageDetailsComponent', () => {
  let component: VertrageDetailsComponent;
  let fixture: ComponentFixture<VertrageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VertrageDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VertrageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
