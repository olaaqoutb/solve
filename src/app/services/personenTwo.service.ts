import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Import models
import { ApiPerson } from '../models-2/ApiPerson';
import { ApiGeplantGebucht } from '../models-2/ApiGeplantGebucht';
import { ApiLeistungskategorien } from '../models-2/ApiLeistungskategorien';
import { ApiProdukt } from '../models-2/ApiProdukt';
import { ApiVertrag } from '../models-2/ApiVertrag';
import { ApiFreigabePositionAnzahl } from '../models-2/ApiFreigabePositionAnzahl';

@Injectable({
  providedIn: 'root'
})
export class PersonenTwoService {

  private readonly json1 = '/1_json_person_detail_response_2.json';
  private readonly json2 = '/1_json_person_detail_response_1750153663701.json';
  // private readonly json3 = '/1_json_personen_dropdownlist_response.json';
  private readonly json3 = '/json_personen_list.json';

  private readonly apiDelay = 500;

  constructor(private http: HttpClient) {
    console.log(' PersonenTwoService initialized in MOCK MODE');
    console.log(' Using JSON files:', this.json1, 'and', this.json2);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let userMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      console.error(' Client error:', error.error.message);
      userMessage = `Network error: ${error.error.message}`;
    } else {
      console.error(` Backend error ${error.status}:`, error.error);

      if (error.status === 404) {
        userMessage = 'Data not found (404). Check file path.';
      } else if (error.status === 500) {
        userMessage = 'Server error (500). Try again later.';
      } else {
        userMessage = `Error: ${error.statusText} (${error.status})`;
      }
    }

    return throwError(() => userMessage);
  }

  /**
   *
   * @param id
   * @param persondetail
   * @param berechneteStunden
   * @param addVertraege
   */
  getPerson(
    id: string,
    persondetail?: string,
    berechneteStunden: boolean = false,
    addVertraege?: boolean
  ): Observable<ApiPerson> {
    console.log(' Loading person:', id);
    console.log(' Parameters:', { persondetail, berechneteStunden, addVertraege });

    // MOCK: Load from json1 (full person with contracts)
    return this.http.get<ApiPerson>(this.json1)
      // .pipe(
      //   delay(this.apiDelay),
      //   map(person => {
      //     console.log(' Person loaded from json1:', person.vorname, person.nachname);
      //     console.log('  Contracts count:', person.vertrag || 0);
      //     return person;
      //   }),
      //   catchError(this.handleError)
      // );

    // PRODUCTION: Backend developer will replace above with:
    /*
    const params = new URLSearchParams();
    if (persondetail) params.append('persondetailgrad', persondetail);
    params.append('berechneteStunden', berechneteStunden.toString());
    if (addVertraege !== undefined) params.append('addVertraege', addVertraege.toString());

    const url = `${this.apiBaseUrl}/personen/${id}?${params.toString()}`;
    return this.http.get<ApiPerson>(url).pipe(
      map(person => {
        console.log('Person loaded from API:', person);
        return person;
      }),
      catchError(this.handleError)
    );
    */
  }

  /**
   *
   * @param berechneteStunden
   * @param nurNamen
   */
  getPersonen(
    berechneteStunden: boolean = false,
    nurNamen: boolean = false
  ): Observable<ApiPerson[]> {
    console.log(' Loading persons list');
    console.log('   Parameters:', { berechneteStunden, nurNamen });
    return this.http.get<ApiPerson[]>(this.json3)
      .pipe(
        delay(this.apiDelay),
        map(response => {
                    const persons: ApiPerson[] = Array.isArray(response) ? response : [];

          console.log('✅ Persons loaded from json2:', persons.length, 'records');
          return persons;
        }),
        catchError(this.handleError)
      );

    // PRODUCTION: Backend developer will replace above with:
    /*
    const params = new URLSearchParams();
    params.append('berechneteStunden', berechneteStunden.toString());
    params.append('nurNamen', nurNamen.toString());

    const url = `${this.apiBaseUrl}/personen?${params.toString()}`;
    return this.http.get<ApiPerson[]>(url).pipe(
      map(persons => {
        console.log(' Persons loaded from API:', persons.length);
        return persons;
      }),
      catchError(this.handleError)
    );
    */
  }

 /**
   * Update an existing person
   *
   * CURRENT: Returns mock data (no actual save)
   * FUTURE: Will call POST /personen/{id} with person data
   *
   * @param person - Complete person object with changes
   * @param id - Person's ID
   */
  updatePerson(person: ApiPerson, id: string): Observable<ApiPerson> {
    console.log('Updating person:', id);
    console.log('Data:', person);
    return of(person).pipe(
      delay(this.apiDelay),
      map(updatedPerson => {
        console.log('Person updated');
        return updatedPerson;
      })
    );

    // PRODUCTION
    /*
    const url = `${this.apiBaseUrl}/personen/${id}`;
    return this.http.post<ApiPerson>(url, person).pipe(
      map(updatedPerson => {
        console.log('Person updated via API');
        return updatedPerson;
      }),
      catchError(this.handleError)
    );
    */
  }

  /**
   *
   *
   * CURRENT: Returns mock data with generated ID
   * FUTURE: Will call POST /personen with person data
   *
   * @param person
   */
  createPerson(person: ApiPerson): Observable<ApiPerson> {
    console.log('Creating new person');
    console.log('Data:', person);
    const newPerson = {
      ...person,
      id: 'MOCK_' + Date.now().toString(),
      version: 1
    };

    return of(newPerson).pipe(
      delay(this.apiDelay),
      map(createdPerson => {
        console.log('Person created (MOCK) with ID:', createdPerson.id);
        return createdPerson;
      })
    );
  }
  getPersonGeplantGebucht(
    personIdStr: string,
    positionIdStr?: string,
    planungsjahrStr?: string
  ): Observable<ApiGeplantGebucht> {
    console.log('Loading planned/booked data for:', personIdStr);

    return of({} as ApiGeplantGebucht).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('Planned/booked data loaded (MOCK - empty)');
        return data;
      })
    );
  }

  getAlleAktuellenLeistungskategorien(): Observable<ApiLeistungskategorien> {
    console.log('Loading performance categories');
    return of({} as ApiLeistungskategorien).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('Performance categories loaded (MOCK - empty)');
        return data;
      })
    );
  }
  getPersonProdukte(
    personId: string,
    filter?: string,
    taetigkeitenAb?: string,
    taetigkeitenBis?: string,
    planungsjahr?: string
  ): Observable<ApiProdukt[]> {
    console.log('Loading products for person:', personId);

    return of([]).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('Products loaded (MOCK - empty array)');
        return data;
      })
    );
  }
  getPersonPersonenverantwortlicher(
    personalverantwortlicherid: string,
    personenDetailStr?: string
  ): Observable<ApiPerson[]> {
    console.log(' Loading responsible persons for:', personalverantwortlicherid);

    return of([]).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log(' Responsible persons loaded (MOCK - empty)');
        return data;
      })
    );
  }

  getVertraegeVerantwortlicher(): Observable<ApiVertrag[]> {
    console.log('Loading responsible contracts');

    return of([]).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('Contracts loaded (MOCK - empty)');
        return data;
      })
    );
  }
  getFreigabePositionenAnzahl(): Observable<ApiFreigabePositionAnzahl> {
    console.log('Loading approval count');

    return of({ anzahl: 0 } as ApiFreigabePositionAnzahl).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log(' Approval count loaded (MOCK - zero)');
        return data;
      })
    );
  }
  isMockMode(): boolean {
    return this.json1.includes('.json') || this.json2.includes('.json');
  }
  getDataSource(): string {
    return this.isMockMode()
      ? ` MOCK MODE: Using JSON files (${this.json1}, ${this.json2})`
      : ' PRODUCTION MODE: Using real API';
  }
}
