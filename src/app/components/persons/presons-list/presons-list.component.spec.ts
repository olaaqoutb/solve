import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresonsListComponent } from './presons-list.component';

describe('PresonsListComponent', () => {
  let component: PresonsListComponent;
  let fixture: ComponentFixture<PresonsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresonsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresonsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
