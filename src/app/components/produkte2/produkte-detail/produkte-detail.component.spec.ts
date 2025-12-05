import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdukteDetailComponent } from './produkte-detail.component';

describe('ProdukteDetailComponent', () => {
  let component: ProdukteDetailComponent;
  let fixture: ComponentFixture<ProdukteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdukteDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdukteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
