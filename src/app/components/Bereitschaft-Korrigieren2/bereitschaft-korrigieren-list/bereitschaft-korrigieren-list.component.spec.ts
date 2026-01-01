import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BereitschaftKorrigierenListComponent } from './bereitschaft-korrigieren-list.component';

describe('BereitschaftKorrigierenListComponent', () => {
  let component: BereitschaftKorrigierenListComponent;
  let fixture: ComponentFixture<BereitschaftKorrigierenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BereitschaftKorrigierenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BereitschaftKorrigierenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
