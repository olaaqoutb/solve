import { Injectable } from '@angular/core';
import { Person } from '../models/person';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConstants } from '../models/app-constants';

@Injectable({
  providedIn: 'root'
})
export class PersonenService {

  constructor(private http: HttpClient) { }


  loadPersonen(): Observable<Person[]> {
    console.log(AppConstants.API_URL_PERSONEN);
    
    return this.http.get<Person[]>(AppConstants.API_URL_PERSONEN + '?berechneteStunden=true&nurNamen=false');
  }


  loadPersonDetails(id : string): Observable<Person> {
    console.log(AppConstants.API_URL_PERSONEN);
    let url = AppConstants.API_URL_PERSONEN + '/' + id + '?persondetailgrad=FullPvTlName&berechneteStunden=true&addVertraege=true';
    return this.http.get<Person>(url);
  }
}
