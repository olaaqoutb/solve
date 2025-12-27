import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TatigkeitenHistorischDetailsComponent } from './tatigkeiten-historisch-details.component';

describe('TatigkeitenHistorischDetailsComponent', () => {
  let component: TatigkeitenHistorischDetailsComponent;
  let fixture: ComponentFixture<TatigkeitenHistorischDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TatigkeitenHistorischDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TatigkeitenHistorischDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
