import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organisationseinheit } from '../models/organisationseinheit';
import { AppConstants } from '../models/app-constants';
 
@Injectable({
  providedIn: 'root'
})
export class OrganisationseinheitService {

  constructor(private http: HttpClient) { }

  getOrganisationseinheiten(): Observable<Organisationseinheit[]> {
    return this.http.get<Organisationseinheit[]>(AppConstants.API_URL_ORGANISATION_EINHEITEN);
  }
}
