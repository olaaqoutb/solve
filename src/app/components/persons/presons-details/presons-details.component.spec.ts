import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresonsDetailsComponent } from './presons-details.component';

describe('PresonsDetailsComponent', () => {
  let component: PresonsDetailsComponent;
  let fixture: ComponentFixture<PresonsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresonsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresonsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
