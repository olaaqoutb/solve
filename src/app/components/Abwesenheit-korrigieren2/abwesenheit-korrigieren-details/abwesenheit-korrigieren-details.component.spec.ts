import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbwesenheitKorrigierenDetailsComponent } from './abwesenheit-korrigieren-details.component';

describe('AbwesenheitKorrigierenDetailsComponent', () => {
  let component: AbwesenheitKorrigierenDetailsComponent;
  let fixture: ComponentFixture<AbwesenheitKorrigierenDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbwesenheitKorrigierenDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbwesenheitKorrigierenDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
