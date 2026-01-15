import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbwesenheitKorrigierenListComponent } from './abwesenheit-korrigieren-list.component';

describe('AbwesenheitKorrigierenListComponent', () => {
  let component: AbwesenheitKorrigierenListComponent;
  let fixture: ComponentFixture<AbwesenheitKorrigierenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbwesenheitKorrigierenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbwesenheitKorrigierenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
