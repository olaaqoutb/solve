import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produkt } from '../models/person';
import { AppConstants } from '../models/app-constants';
 
@Injectable({
  providedIn: 'root'
})
export class ProduktService {

  constructor(private http: HttpClient) { }

 

  getProdukte(): Observable<Produkt[]> {
    return this.http.get<Produkt[]>(AppConstants.API_URL_PRODUKTE);
  }
}
