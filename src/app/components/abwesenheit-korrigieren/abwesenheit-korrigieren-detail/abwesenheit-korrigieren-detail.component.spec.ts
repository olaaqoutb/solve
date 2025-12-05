import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbwesenheitKorrigierenDetailComponent } from './abwesenheit-korrigieren-detail.component';

describe('AbwesenheitKorrigierenDetailComponent', () => {
  let component: AbwesenheitKorrigierenDetailComponent;
  let fixture: ComponentFixture<AbwesenheitKorrigierenDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbwesenheitKorrigierenDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbwesenheitKorrigierenDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
