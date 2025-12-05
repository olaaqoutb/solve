import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Datalistorganizationanc } from '../../../models/datalistorganizationanc';

@Injectable({
  providedIn: 'root'
})
export class SharedDataServiceService {

  constructor() { }

  private selectedOrganizationSubject = new BehaviorSubject<Datalistorganizationanc | null>(null);
  selectedOrganization$ = this.selectedOrganizationSubject.asObservable();

  setSelectedOrganization(org: Datalistorganizationanc) {
    this.selectedOrganizationSubject.next(org);
  }
  getSelectedOrganization(): Observable<Datalistorganizationanc | null> {
    return this.selectedOrganization$;
  }
  clearSelectedOrganization(): void {
    this.selectedOrganizationSubject.next(null);
  }
}