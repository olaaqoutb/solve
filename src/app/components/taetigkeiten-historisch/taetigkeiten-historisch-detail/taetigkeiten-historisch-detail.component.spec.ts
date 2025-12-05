import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaetigkeitenHistorischDetailComponent } from './taetigkeiten-historisch-detail.component';

describe('TaetigkeitenHistorischDetailComponent', () => {
  let component: TaetigkeitenHistorischDetailComponent;
  let fixture: ComponentFixture<TaetigkeitenHistorischDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaetigkeitenHistorischDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaetigkeitenHistorischDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
