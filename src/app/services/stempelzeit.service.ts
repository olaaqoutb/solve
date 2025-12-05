import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, map } from 'rxjs';
import { GetitRestService } from './getit-rest.service';
import { ApiStempelzeit } from '../models-2/ApiStempelzeit';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StempelzeitService {
  private listUrl = "stempelzeit-list.json"
  private detailUrl = "stempelzeit-details.json"
  private detail2 = "zivildiener-details.json"

  constructor(
    private http: HttpClient,
    private getitService: GetitRestService
  ) { }

  // ============================================================================
  // MAIN METHOD: Get Stempelzeiten
  // ============================================================================
  // Instructions for Backend Developer:
  // - Currently using JSON file (active code below)
  // - To switch to backend: Comment out JSON section, uncomment BACKEND section
  // ============================================================================

  getStempelzeitenSmart(personId: string): Observable<ApiStempelzeit[]> {
    console.log('� Loading stempelzeiten for person:', personId);

    // -------------------------------------------------------------------------
    // OPTION 1: JSON FILE (CURRENTLY ACTIVE) 
    // -------------------------------------------------------------------------
    // Using local JSON file for development/testing
    return this.getdetail2ById(personId).pipe(
      map(staticData => {
        const extractedData = this.extractStempelzeitenFromStatic(staticData);
        console.log(' Loaded from JSON file:', extractedData.length, 'entries');
        return extractedData;
      }),
      catchError(error => {
        console.error('Error loading from JSON file:', error);
        return of([]);
      })
    );

    // -------------------------------------------------------------------------
    // OPTION 2: BACKEND API 
    // -------------------------------------------------------------------------
    // Uncomment this section when backend is ready:
    /*
    return this.getitService.getPersonStempelzeitenOhneAbwesenheit(personId).pipe(
      map(backendData => {
        console.log('Loaded from BACKEND API (without absences):', backendData.length, 'entries');
        return backendData;
      }),
      catchError(error => {
        console.error('Backend API error:', error);
        return throwError(() => 'Failed to load data from backend');
      })
    );
    */
  }

  // ============================================================================
  // MAIN METHOD: Save Stempelzeit
  // ============================================================================
  // Instructions for Backend Developer:
  // - Currently simulating save with JSON (active code below)
  // - To switch to backend: Comment out JSON section, uncomment BACKEND section
  // ============================================================================

  saveStempelzeitSmart(stempelzeit: ApiStempelzeit, personId: string, isCreating: boolean): Observable<ApiStempelzeit> {
    console.log('Saving stempelzeit, isCreating:', isCreating);

    //  JSON FILE SIMULATION (CURRENTLY ACTIVE) 
    // Simulating save operation for development/testing
    const savedStempelzeit: ApiStempelzeit = {
      ...stempelzeit
    };
    console.log('Simulated save to JSON (no actual persistence)');
    return of(savedStempelzeit);

    //  BACKEND API 
    // Uncomment this section when backend is ready:
    /*
    if (isCreating) {
      return this.getitService.createStempelzeit(stempelzeit, personId, 'ZivildienerFO').pipe(
        map(response => {
          console.log('Created via BACKEND API');
          return response;
        }),
        catchError(error => {
          console.error(' Backend create error:', error);
          return throwError(() => 'Failed to create stempelzeit');
        })
      );
    } else {
      return this.getitService.updateStempelzeit(stempelzeit, personId).pipe(
        map(response => {
          console.log('Updated via BACKEND API');
          return response;
        }),
        catchError(error => {
          console.error(' Backend update error:', error);
          return throwError(() => 'Failed to update stempelzeit');
        })
      );
    }
    */
  }

  // ============================================================================
  // MAIN METHOD: Delete Stempelzeit
  // ============================================================================
  // Instructions for Backend Developer:
  // - Currently simulating delete with JSON (active code below)
  // - To switch to backend: Comment out JSON section, uncomment BACKEND section
  // ============================================================================

  deleteStempelzeitSmart(stempelzeit: ApiStempelzeit, personId: string): Observable<void> {
    console.log('Deleting stempelzeit');

    // JSON FILE SIMULATION 

    // Simulating delete operation for development/testing
    console.log('Simulated delete from JSON (no actual deletion)');
    return of(undefined);

    // BACKEND API (READY FOR PRODUCTION) 
    // Uncomment this section when backend is ready:
    /*
    return this.getitService.deleteStempelzeit(stempelzeit, personId).pipe(
      map(() => {
        console.log('Deleted via BACKEND API');
        return undefined;
      }),
      catchError(error => {
        console.error('Backend delete error:', error);
        return throwError(() => 'Failed to delete stempelzeit');
      })
    );
    */
  }

  // ============================================================================
  // HELPER METHODS (Used by both JSON and Backend approaches)
  // ============================================================================

  // Legacy methods for backward compatibility
  getStempelzeiten(): Observable<any[]> {
    return this.http.get<any[]>(this.listUrl).pipe(
      catchError(this.handelError)
    );
  }

  getdetail2(): Observable<any[]> {
    return this.http.get<any[]>(this.detail2).pipe(
      catchError(this.handelError)
    );
  }

  getdetail2ById(id: string): Observable<any> {
    return this.http.get<any>(this.detail2).pipe(
      catchError(this.handelError)
    );
  }

  getStempelzeitenById(id: string): Observable<any> {
    return this.http.get<any>(this.detailUrl).pipe(
      catchError(this.handelError)
    );
  }

  // Extract stempelzeiten from various JSON data structures
  private extractStempelzeitenFromStatic(data: any): ApiStempelzeit[] {
    if (Array.isArray(data)) {
      return data;
    } else if (data?.timeEntries && Array.isArray(data.timeEntries)) {
      return data.timeEntries;
    } else if (data?.stempelzeiten && Array.isArray(data.stempelzeiten)) {
      return data.stempelzeiten;
    } else if (data?.content && Array.isArray(data.content)) {
      return data.content;
    } else if (data?.login) {
      return [data];
    } else {
      console.warn(' Unknown JSON data structure:', data);
      return [];
    }
  }

  // Error handler for HTTP requests
  private handelError(error: HttpErrorResponse) {
    let userMessage = 'An unknown error occurred!'
    if (error.error instanceof ErrorEvent) {
      console.log('A client side error occurred:', error.error.message);
      userMessage = `network error: ${error.error.message}`;
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
      if (error.status === 404) {
        userMessage = 'The requested stempelzeit data could not be found (Error 404). Please check the file path.';
      } else if (error.status === 500) {
        userMessage = 'There was a server error (Error 500). Please try again later.';
      } else {
        userMessage = `Error: ${error.statusText} (code: ${error.status})`;
      }
    }
    return throwError(() => userMessage)
  }
}
