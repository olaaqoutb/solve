import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TatigkeitenHistorischListComponent } from './tatigkeiten-historisch-list.component';

describe('TatigkeitenHistorischListComponent', () => {
  let component: TatigkeitenHistorischListComponent;
  let fixture: ComponentFixture<TatigkeitenHistorischListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TatigkeitenHistorischListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TatigkeitenHistorischListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
