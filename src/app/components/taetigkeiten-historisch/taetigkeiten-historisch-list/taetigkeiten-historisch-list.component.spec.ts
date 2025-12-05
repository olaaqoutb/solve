import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaetigkeitenHistorischListComponent } from './taetigkeiten-historisch-list.component';

describe('TaetigkeitenHistorischListComponent', () => {
  let component: TaetigkeitenHistorischListComponent;
  let fixture: ComponentFixture<TaetigkeitenHistorischListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaetigkeitenHistorischListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaetigkeitenHistorischListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
