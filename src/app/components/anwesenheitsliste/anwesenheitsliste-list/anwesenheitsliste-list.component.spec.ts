import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnwesenheitslisteListComponent } from './anwesenheitsliste-list.component';

describe('AnwesenheitslisteListComponent', () => {
  let component: AnwesenheitslisteListComponent;
  let fixture: ComponentFixture<AnwesenheitslisteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnwesenheitslisteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnwesenheitslisteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
