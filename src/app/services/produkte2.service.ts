// src/app/produkt.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduktService {

  // Define the paths to JSON files
  private listUrl = 'produkte.json';
  private detailUrl = 'produkte_detail.json';

  constructor(private http: HttpClient) { }


  getProdukte(): Observable<any[]> {
    return this.http.get<any[]>(this.listUrl).pipe(
      catchError(this.handleError)
    );
  }


  getProduktById(id: string): Observable<any> {
    return this.http.get<any>(this.detailUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Reusable error handler
   private handleError(error: HttpErrorResponse) {
    // This variable will hold the user-friendly error message.
    let userMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      console.error('A client-side error occurred:', error.error.message);
      userMessage = `Network error: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was:`, error.error);

      // Customize the message based on the status code
      if (error.status === 404) {
        userMessage = 'The requested product data could not be found (Error 404). Please check the file path.';
      } else if (error.status === 500) {
        userMessage = 'There was a server error (Error 500). Please try again later.';
      } else {
        // For other errors, use the status text if available.
        userMessage = `Error: ${error.statusText} (Code: ${error.status})`;
      }
    }
    // This is what the component will receive in its 'error' block.
    return throwError(() => userMessage);
  }

}
