import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbsencePeriod, AttendanceEntry } from '../models/attendance.model';
import { AppConstants } from '../models/app-constants';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private apiUrl = '/api/attendance'; // Adjust this URL to your backend endpoint

  constructor(private http: HttpClient) {}

  getAttendanceList(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }


  
  getPersonenAnweesnd(): Observable<AttendanceEntry[]> {
    return this.http.get<AttendanceEntry[]>(AppConstants.API_URL_PERSONEN_ANWESEND);
 
    }

  getAbwesenheitsListe(): Observable<AttendanceEntry[]> {
    return this.http.get<AttendanceEntry[]>(AppConstants.API_URL_ABWESENHEIT + '?personId=343200000000078&zeitTyp=ABWESENHEIT&logoffAb=2025-03-03');
  }
  
  getPersonAnwersenheitsListe(personId : string): Observable<AbsencePeriod[]> {
    console.log('Person-Id', personId);
    return this.http.get<AbsencePeriod[]>(AppConstants.API_URL_ANWESENHEITSLISTE_DETAIL + '?personId=' + personId + '&zeitTyp=ABWESENHEIT&logoffAb=2025-01-27');
  }

  calculateDays(login: Date | null, logoff: Date | null): string | null {
    if (logoff && login) {
      const diff = logoff.getTime() - login.getTime();
      const totalHours = diff / 1000 / 60 / 60;
      const remainingHours = totalHours % 24;
      const fullDays = (totalHours - remainingHours) / 24;

      let days = fullDays;
      if (remainingHours >= 8.0) {
        days += 1;
      }

      return `${days}`;
    } else {
      return null;
    }
  }
  
}
