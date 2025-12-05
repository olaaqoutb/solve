import { Injectable, signal } from '@angular/core';
 import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Person, Produkt, StempelzeitDto } from '../models/person';

@Injectable({
  providedIn: 'root'
})
export class TaetigkeitenHistorischService {

 

  private apiUrl = 'http://localhost:29200/at.gv.bmi.getit3-d/srv/v1/personen?berechneteStunden=false&nurNamen=true'; // 'https://your-api.com/Persons'; // Replace with actual API URL

  private mainApiUrl = 'http://localhost:29200/at.gv.bmi.getit3-d/srv/v1/personen';
  personList = signal<Person[]>([]); // Store Person list
  selectedPerson = signal<Person | null>(null); // Store selected Person
 
  constructor(private http: HttpClient) {}

  fetchPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.apiUrl);
  }


  fetchStemplZeiten(): Observable<StempelzeitDto[]> {
    return this.http.get<StempelzeitDto[]>(this.mainApiUrl +  '/1500000000579/stempelzeiten?loginBis=2024-12-31&loginAb=2024-01-01');
  }

  fetchProdukte(): Observable<Produkt[]> {
    return this.http.get<Produkt[]>(this.mainApiUrl +  '/1500000000579/produkte?filter=gebucht&taetigkeitenAb=2024-01-01&taetigkeitenBis=2024-12-31');
  }

  setPersons(Persons: Person[]) {
    this.personList.set(Persons);
  }

  selectPerson(Person: Person) {
    this.selectedPerson.set(Person);
  }

  resetSelection() {
    this.selectedPerson.set(null);
  }

  clearSelectedPerson() {
    this.selectedPerson.set(null);
  }

}
