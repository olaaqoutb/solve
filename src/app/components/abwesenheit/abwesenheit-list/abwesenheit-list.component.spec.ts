import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbwesenheitListComponent } from './abwesenheit-list.component';

describe('AbwesenheitListComponent', () => {
  let component: AbwesenheitListComponent;
  let fixture: ComponentFixture<AbwesenheitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbwesenheitListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbwesenheitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
