import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BereitschaftKorrigierenDetailsComponent } from './bereitschaft-korrigieren-details.component';

describe('BereitschaftKorrigierenDetailsComponent', () => {
  let component: BereitschaftKorrigierenDetailsComponent;
  let fixture: ComponentFixture<BereitschaftKorrigierenDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BereitschaftKorrigierenDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BereitschaftKorrigierenDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
