import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConstants } from '../models/app-constants';
import { AbwesenheitItem } from '../models/abwesenheit';
import { StempelzeitDto } from '../models/person';

@Injectable({
  providedIn: 'root'
})
export class AbwesenheitService {

  constructor(private http: HttpClient) {}


  getAbwesenheitsListe(): Observable<StempelzeitDto[]> {
    return this.http.get<StempelzeitDto[]>(AppConstants.API_URL_ABWESENHEIT + '?personId=343200000000078&zeitTyp=ABWESENHEIT&logoffAb=2025-06-10');
  }

  createAbwesenheit(stempelzeitDto: StempelzeitDto): Observable<any> {
    const url = 'http://localhost:8085/at.gv.bmi.getit3-d/srv/v1/personen/343200000000078/stempelzeiten?vorgang=Abwesenheitsverwaltung';
    return this.http.post(url, stempelzeitDto );
  }

  editAbwesenheit(stempelzeitDto: StempelzeitDto): Observable<any> {

    const url = 'http://localhost:8085/at.gv.bmi.getit3-d/srv/v1/stempelzeiten/' + stempelzeitDto.id + '?vorgang=Abwesenheitsverwaltung';
    console.log('editAbwesenheit', url);
    return this.http.post(url, stempelzeitDto );
  }

 
  deleteAbwesenheit(stempelzeitDto: StempelzeitDto): Observable<any> {
    
    const url ='http://localhost:8085/at.gv.bmi.getit3-d/srv/v1/stempelzeiten/'+ stempelzeitDto.id +'?vorgang=Abwesenheitsverwaltung' ;
    // 'http://localhost:8085/at.gv.bmi.getit3-d/srv/v1/personen/343200000000078/stempelzeiten?vorgang=Abwesenheitsverwaltung';
    console.log('delete-URL', url);
    return this.http.post(url, stempelzeitDto );
  }
}
