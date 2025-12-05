import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnwesenheitslisteDetailsComponent } from './anwesenheitsliste-details.component';

describe('AnwesenheitslisteDetailsComponent', () => {
  let component: AnwesenheitslisteDetailsComponent;
  let fixture: ComponentFixture<AnwesenheitslisteDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnwesenheitslisteDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnwesenheitslisteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
