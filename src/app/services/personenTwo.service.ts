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

/**
 * PersonenTwoService - Mock Service Implementation
 *
 * PURPOSE:
 * This service provides mock data using JSON files while the backend is being developed.
 * When backend is ready, simply change the JSON paths to real API URLs.
 *
 * JSON FILES USED:
 * - json1 (person-detail.json): Full person details WITH contracts (Thiem Peter Franz data)
 * - json2 (person-list.json): List of persons WITHOUT full details (Gernot Egger, etc.)
 *
 * MIGRATION STRATEGY:
 * When backend is ready, backend developer only needs to:
 * 1. Change mockDataPath to real API base URL
 * 2. Uncomment the real API calls (already prepared below)
 * 3. Comment out the JSON file loading
 */
@Injectable({
  providedIn: 'root'
})
export class PersonenTwoService {

  // ========================================================================
  // CONFIGURATION - Change these when backend is ready
  // ========================================================================

  private readonly json1 = '/1_json_person_detail_response_2.json';  // Full person WITH contracts
  private readonly json2 = '/1_json_person_detail_response_1750153663701.json';    // Person list WITHOUT contracts
  private readonly json3 = '/1_json_personen_dropdownlist_response.json';    // Person list WITHOUT contracts

  // Production mode: Backend developer will uncomment this and comment out json files
  // private readonly apiBaseUrl = 'http://127.0.0.1:8888/getitgui/proxy/v1';

  private readonly apiDelay = 500; // Simulate network delay (remove in production)

  constructor(private http: HttpClient) {
    console.log('🔧 PersonenTwoService initialized in MOCK MODE');
    console.log('📁 Using JSON files:', this.json1, 'and', this.json2);
  }

  // ========================================================================
  // ERROR HANDLING
  // ========================================================================

  private handleError(error: HttpErrorResponse): Observable<never> {
    let userMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('❌ Client error:', error.error.message);
      userMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      console.error(`❌ Backend error ${error.status}:`, error.error);

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

  // ========================================================================
  // PERSON METHODS - Using json1 (person-detail.json)
  // ========================================================================

  /**
   * Get a single person by ID
   *
   * CURRENT: Loads from json1 (person-detail.json)
   * FUTURE: Will call GET /personen/{id}?persondetailgrad=X&berechneteStunden=Y&addVertraege=Z
   *
   * WHY json1? Because we need FULL person details INCLUDING contracts
   *
   * @param id - Person ID
   * @param persondetail - Detail level (FullPvTlName, Id, etc.)
   * @param berechneteStunden - Include calculated hours
   * @param addVertraege - Include contracts (vertrag array)
   */
  getPerson(
    id: string,
    persondetail?: string,
    berechneteStunden: boolean = false,
    addVertraege?: boolean
  ): Observable<ApiPerson> {
    console.log('📥 Loading person:', id);
    console.log('   Parameters:', { persondetail, berechneteStunden, addVertraege });

    // MOCK: Load from json1 (full person with contracts)
    return this.http.get<ApiPerson>(this.json1)
      .pipe(
        delay(this.apiDelay),
        map(person => {
          console.log('✅ Person loaded from json1:', person.vorname, person.nachname);
          console.log('   Contracts count:', person.vertrag || 0);
          return person;
        }),
        catchError(this.handleError)
      );

    // PRODUCTION: Backend developer will replace above with:
    /*
    const params = new URLSearchParams();
    if (persondetail) params.append('persondetailgrad', persondetail);
    params.append('berechneteStunden', berechneteStunden.toString());
    if (addVertraege !== undefined) params.append('addVertraege', addVertraege.toString());

    const url = `${this.apiBaseUrl}/personen/${id}?${params.toString()}`;
    return this.http.get<ApiPerson>(url).pipe(
      map(person => {
        console.log('✅ Person loaded from API:', person);
        return person;
      }),
      catchError(this.handleError)
    );
    */
  }

  /**
   * Get list of all persons
   *
   * CURRENT: Loads from json2 (person-list.json)
   * FUTURE: Will call GET /personen?berechneteStunden=X&nurNamen=Y
   *
   * WHY json2? Because list view doesn't need full contracts data
   *
   * @param berechneteStunden - Include calculated hours
   * @param nurNamen - Only return names (lightweight)
   */
  getPersonen(
    berechneteStunden: boolean = false,
    nurNamen: boolean = false
  ): Observable<ApiPerson[]> {
    console.log('📥 Loading persons list');
    console.log('   Parameters:', { berechneteStunden, nurNamen });

    // MOCK: Load from json2 (persons list without full details)
    return this.http.get<ApiPerson[]>(this.json3)
      .pipe(
        delay(this.apiDelay),
        map(persons => {
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
        console.log('✅ Persons loaded from API:', persons.length);
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
   * id - Person's ID
   */
  id:string='29200000013498'
  updatePerson(person: ApiPerson, id: string): Observable<ApiPerson> {
    console.log('💾 Updating person:', id);
    console.log('   Data:', person);

    // MOCK: Just return the person (simulate successful save)
    return of(person).pipe(
      delay(this.apiDelay),
      map(updatedPerson => {
        console.log('✅ Person updated (MOCK - no real save)');
        return updatedPerson;
      })
    );

    // PRODUCTION: Backend developer will replace above with:
    /*
    const url = `${this.apiBaseUrl}/personen/${id}`;
    return this.http.post<ApiPerson>(url, person).pipe(
      map(updatedPerson => {
        console.log('✅ Person updated via API');
        return updatedPerson;
      }),
      catchError(this.handleError)
    );
    */
  }

  /**
   * Create a new person
   *
   * CURRENT: Returns mock data with generated ID
   * FUTURE: Will call POST /personen with person data
   *
   * @param person - Person object (without ID)
   */
  createPerson(person: ApiPerson): Observable<ApiPerson> {
    console.log('💾 Creating new person');
    console.log('   Data:', person);

    // MOCK: Generate fake ID and return
    const newPerson = {
      ...person,
      id: 'MOCK_' + Date.now().toString(),
      version: 1
    };

    return of(newPerson).pipe(
      delay(this.apiDelay),
      map(createdPerson => {
        console.log('✅ Person created (MOCK) with ID:', createdPerson.id);
        return createdPerson;
      })
    );

    // PRODUCTION: Backend developer will replace above with:
    /*
    const url = `${this.apiBaseUrl}/personen`;
    return this.http.post<ApiPerson>(url, person).pipe(
      map(createdPerson => {
        console.log('✅ Person created via API with ID:', createdPerson.id);
        return createdPerson;
      }),
      catchError(this.handleError)
    );
    */
  }

  // ========================================================================
  // ADDITIONAL PERSON METHODS
  // ========================================================================

  /**
   * Get planned and booked hours for a person
   *
   * CURRENT: Returns empty mock data
   * FUTURE: Will call GET /personen/{id}/geplantGebucht
   *
   * Used to show how many hours are planned vs actually worked
   */
  getPersonGeplantGebucht(
    personIdStr: string,
    positionIdStr?: string,
    planungsjahrStr?: string
  ): Observable<ApiGeplantGebucht> {
    console.log('📥 Loading planned/booked data for:', personIdStr);

    // MOCK: Return empty data structure
    return of({} as ApiGeplantGebucht).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('✅ Planned/booked data loaded (MOCK - empty)');
        return data;
      })
    );

    // PRODUCTION: Backend developer will replace above with:
    /*
    const params = new URLSearchParams();
    if (positionIdStr) params.append('produktposition', positionIdStr);
    if (planungsjahrStr) params.append('planungsjahr', planungsjahrStr);

    const url = `${this.apiBaseUrl}/personen/${personIdStr}/geplantGebucht?${params.toString()}`;
    return this.http.get<ApiGeplantGebucht>(url).pipe(
      map(data => {
        console.log('✅ Planned/booked data loaded from API');
        return data;
      }),
      catchError(this.handleError)
    );
    */
  }

  /**
   * Get performance categories (Leistungskategorien)
   *
   * CURRENT: Returns empty mock data
   * FUTURE: Will call GET /leistungskategorien
   *
   * Used for dropdowns showing skill levels (Junior, Senior, etc.)
   */
  getAlleAktuellenLeistungskategorien(): Observable<ApiLeistungskategorien> {
    console.log('📥 Loading performance categories');

    // MOCK: Return empty data
    return of({} as ApiLeistungskategorien).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('✅ Performance categories loaded (MOCK - empty)');
        return data;
      })
    );

    // PRODUCTION: Backend developer will replace above with:
    /*
    const url = `${this.apiBaseUrl}/leistungskategorien`;
    return this.http.get<ApiLeistungskategorien>(url).pipe(
      map(data => {
        console.log('✅ Performance categories loaded from API');
        return data;
      }),
      catchError(this.handleError)
    );
    */
  }

  /**
   * Get products/projects for a person
   *
   * CURRENT: Returns empty array
   * FUTURE: Will call GET /personen/{id}/produkte
   */
  getPersonProdukte(
    personId: string,
    filter?: string,
    taetigkeitenAb?: string,
    taetigkeitenBis?: string,
    planungsjahr?: string
  ): Observable<ApiProdukt[]> {
    console.log('📥 Loading products for person:', personId);

    return of([]).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('✅ Products loaded (MOCK - empty array)');
        return data;
      })
    );

    // PRODUCTION: Backend developer will add real implementation
  }

  /**
   * Get responsible persons
   *
   * CURRENT: Returns empty array
   * FUTURE: Will call GET /personen/{id}/personenverantwortliche
   */
  getPersonPersonenverantwortlicher(
    personalverantwortlicherid: string,
    personenDetailStr?: string
  ): Observable<ApiPerson[]> {
    console.log('📥 Loading responsible persons for:', personalverantwortlicherid);

    return of([]).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('✅ Responsible persons loaded (MOCK - empty)');
        return data;
      })
    );

    // PRODUCTION: Backend developer will add real implementation
  }

  /**
   * Get contracts where person is responsible
   *
   * CURRENT: Returns empty array
   * FUTURE: Will call GET /vertraege/vertragsverantwortlicher
   */
  getVertraegeVerantwortlicher(): Observable<ApiVertrag[]> {
    console.log('📥 Loading responsible contracts');

    return of([]).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('✅ Contracts loaded (MOCK - empty)');
        return data;
      })
    );

    // PRODUCTION: Backend developer will add real implementation
  }

  /**
   * Get approval position count
   *
   * CURRENT: Returns zero
   * FUTURE: Will call GET /freigabePositionen/anzahl
   */
  getFreigabePositionenAnzahl(): Observable<ApiFreigabePositionAnzahl> {
    console.log('📥 Loading approval count');

    return of({ anzahl: 0 } as ApiFreigabePositionAnzahl).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log('✅ Approval count loaded (MOCK - zero)');
        return data;
      })
    );

    // PRODUCTION: Backend developer will add real implementation
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Check if running in mock mode
   * Useful for showing "DEVELOPMENT MODE" indicator in UI
   */
  isMockMode(): boolean {
    return this.json1.includes('.json') || this.json2.includes('.json');
  }

  /**
   * Get description of current data source
   * Useful for debugging
   */
  getDataSource(): string {
    return this.isMockMode()
      ? `🔧 MOCK MODE: Using JSON files (${this.json1}, ${this.json2})`
      : '🌐 PRODUCTION MODE: Using real API';
  }
}

/**
 * ============================================================================
 * MIGRATION GUIDE FOR BACKEND DEVELOPER
 * ============================================================================
 *
 * When backend is ready:
 *
 * 1. Update configuration at top of file:
 *    - Comment out: private readonly json1 = '...';
 *    - Comment out: private readonly json2 = '...';
 *    - Uncomment: private readonly apiBaseUrl = 'http://...';
 *
 * 2. For each method:
 *    - Comment out the MOCK section
 *    - Uncomment the PRODUCTION section
 *
 * 3. Remove apiDelay or set to 0
 *
 * 4. Test each endpoint one by one
 *
 * 5. Remove JSON files when no longer needed
 *
 * That's it! The component code doesn't need any changes.
 * ============================================================================
 */
