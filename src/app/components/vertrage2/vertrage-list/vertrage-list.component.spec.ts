import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VertrageListComponent } from './vertrage-list.component';

describe('VertrageListComponent', () => {
  let component: VertrageListComponent;
  let fixture: ComponentFixture<VertrageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VertrageListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VertrageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
