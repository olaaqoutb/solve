// src/app/vertrag.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VertrageService {

  // Define the path to your JSON file
  private vertrageDetailUrl = '1_json_personen_dropdownlist_response.json';
private vertrageList="1_json_vertrag_list_response.json"
  constructor(private http: HttpClient) { }
getOneVertrage(id:string):Observable<any>{
  return this.http.get<any>(this.vertrageDetailUrl).pipe(
    catchError(this.handleError)
  )
}
  getVertrageDetails(): Observable<any> {
    return this.http.get<any>(this.vertrageList).pipe(
      catchError(this.handleError)
    );
  }

  // Reusable error handler
  private handleError(error: HttpErrorResponse) {
    let userMessage = 'Ein unbekannter Fehler ist aufgetreten!';

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      console.error('Ein clientseitiger Fehler ist aufgetreten:', error.error.message);
      userMessage = `Netzwerkfehler: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend gab Fehlercode ${error.status} zurück, ` +
        `Body war:`, error.error);

      if (error.status === 404) {
        userMessage = 'Die angeforderten Vertragsdaten konnten nicht gefunden werden (Fehler 404). Bitte überprüfen Sie den Dateipfad.';
      } else if (error.status === 500) {
        userMessage = 'Es gab einen Serverfehler (Fehler 500). Bitte versuchen Sie es später erneut.';
      } else {
        userMessage = `Fehler: ${error.statusText} (Code: ${error.status})`;
      }
    }
    return throwError(() => userMessage);
  }
}
