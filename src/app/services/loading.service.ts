import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCounter = 0;

  constructor() {}

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  showLoading(): void {
    this.loadingCounter++;
    this.loadingSubject.next(true);
  }

  hideLoading(): void {
    this.loadingCounter--;
    if (this.loadingCounter <= 0) {
      this.loadingCounter = 0;
      this.loadingSubject.next(false);
    }
  }
}
