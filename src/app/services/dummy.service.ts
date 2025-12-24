import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ApiPerson } from '../models-2/ApiPerson';
import { ApiGeplantGebucht } from '../models-2/ApiGeplantGebucht';
import { ApiLeistungskategorien } from '../models-2/ApiLeistungskategorien';
import { ApiProdukt } from '../models-2/ApiProdukt';
import { ApiFreigabePositionAnzahl } from '../models-2/ApiFreigabePositionAnzahl';
import { ApiVertrag } from '../models-2/ApiVertrag';
import { ApiStempelzeit } from '../models-2/ApiStempelzeit';
import { Organisationseinheit } from '../models/organisationseinheit';
import { AppConstants } from '../models/app-constants';
import { Datalistorganizationanc } from '../models/datalistorganizationanc';

@Injectable({
  providedIn: 'root'
})
export class DummyService {

  ///////// Personen Component ///////////////
  private readonly json1 = '/1_json_person_detail_response_2.json';
  private readonly json2 = '/1_json_person_detail_response_1750153663701.json';
  private readonly json3 = '/json_personen_list.json';
  private readonly apiDelay = 500;

  ///////// Stempelzeiten Component ///////////////
  private listUrl = "stempelzeit-list.json"
  private detailUrl = "stempelzeit-details.json"
  private detail2 = "zivildiener-details.json"

  ///////// Products JSON - NEW! ///////////////
  private produkteUrl = "tatigkeiten-historisch-produkt.json"  // Add your products JSON file name here

  constructor(private http: HttpClient) { }

  ///////////////////////////////// Personen Component ////////////////////////////////////////

  getPerson(
    id: string,
    persondetail?: string,
    berechneteStunden: boolean = false,
    addVertraege?: boolean
  ): Observable<ApiPerson> {
    console.log("loading id " + id);
    console.log("parameters:", { persondetail, berechneteStunden, addVertraege });

    return this.http.get<ApiPerson>(this.json1).pipe(
      delay(this.apiDelay),
      map(person => {
        console.log("person details loaded from json1");
        return person;
      })
    );
  }

  getPersonen(
    berechneteStunden: boolean = false,
    nurNamen: boolean = false
  ): Observable<ApiPerson[]> {
    console.log('loading persons list');
    console.log('parameters:', { berechneteStunden, nurNamen });

    return this.http.get<ApiPerson[]>(this.json3).pipe(
      delay(this.apiDelay),
      map(response => {
        const persons: ApiPerson[] = Array.isArray(response) ? response : [];
        console.log("persons loaded from json3:", persons.length);
        return persons;
      })
    );
  }

  updatePerson(person: ApiPerson, id: string): Observable<ApiPerson> {
    console.log("updating person", id);
    return of(person).pipe(
      delay(this.apiDelay),
      map(updatedPerson => {
        console.log('person updated');
        return updatedPerson;
      })
    );
  }

  createPerson(person: ApiPerson): Observable<ApiPerson> {
    console.log("creating person");
    const newPerson = {
      ...person,
      id: 'MOCK_' + Date.now().toString(),
      version: 1
    };

    return of(newPerson).pipe(
      delay(this.apiDelay),
      map(createdPerson => {
        console.log("created mock person with id:", createdPerson.id);
        return createdPerson;
      })
    );
  }

  getPersonGeplantGebucht(
    personIdStr: string,
    positionIdStr?: string,
    planungsjahrStr?: string
  ): Observable<ApiGeplantGebucht> {
    console.log("Loading planned/booked data for:", personIdStr);
    return of({} as ApiGeplantGebucht).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log("Planned/booked data loaded (MOCK - empty)");
        return data;
      })
    );
  }

  getAlleAktuellenLeistungskategorien(): Observable<ApiLeistungskategorien> {
    console.log("Loading performance categories");
    return of({} as ApiLeistungskategorien).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log("Performance categories loaded (MOCK - empty)");
        return data;
      })
    );
  }

  // FIXED METHOD - Now loads from actual JSON file!
  getPersonProdukte(
    personId: string,
    filter?: string,
    taetigkeitenAb?: string,
    taetigkeitenBis?: string,
    planungsjahr?: string
  ): Observable<ApiProdukt[]> {
    console.log("Loading products for person:", personId);
    console.log("parameters:", { filter, taetigkeitenAb, taetigkeitenBis });

    // Load from the products JSON file
    return this.http.get<ApiProdukt[]>(this.produkteUrl).pipe(
      delay(this.apiDelay),
      map(products => {
        if (Array.isArray(products)) {
          console.log("Products loaded from JSON:", products.length);
          return products;
        } else {
          console.log("Products data is not an array");
          return [];
        }
      })
    );
  }

  getPersonPersonenverantwortlicher(
    personalverantwortlicherid: string,
    personenDetailStr?: string
  ): Observable<ApiPerson[]> {
    console.log("Loading responsible persons for:", personalverantwortlicherid);
    return of([]).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log("Responsible persons loaded (MOCK - empty)");
        return data;
      })
    );
  }

  getVertraegeVerantwortlicher(): Observable<ApiVertrag[]> {
    console.log("Loading responsible contracts");
    return of([]).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log("Contracts loaded (MOCK - empty)");
        return data;
      })
    );
  }

  getFreigabePositionenAnzahl(): Observable<ApiFreigabePositionAnzahl> {
    console.log("Loading approval count");
    return of({ anzahl: 0 } as ApiFreigabePositionAnzahl).pipe(
      delay(this.apiDelay),
      map(data => {
        console.log("Approval count loaded (MOCK - zero)");
        return data;
      })
    );
  }

  ///////////////////////////////// Stempelzeiten & Zivildiener Component ////////////////////////////////////////

  getPersonStempelzeiten(
    personId: string,
    loginAb?: string,
    loginBis?: string
  ): Observable<ApiStempelzeit[]> {
    console.log('Loading stempelzeiten for person:', personId);
    console.log('parameters:', { loginAb, loginBis });

    // Use detailUrl instead of listUrl for actual time entries
    return this.http.get<any>(this.detailUrl).pipe(
      delay(this.apiDelay),
      map(data => {
        if (Array.isArray(data)) {
          console.log('Stempelzeiten loaded from JSON:', data.length);
          return data;
        } else if (data && typeof data === 'object') {
          const extracted = data.stempelzeiten ||
            data.timeEntries ||
            data.content ||
            [];
          console.log('Stempelzeiten loaded from JSON (nested):', extracted.length);
          return extracted;
        }
        console.log('Stempelzeiten loaded from JSON: empty');
        return [];
      })
    );
  }

  createStempelzeit(
    dto: ApiStempelzeit,
    personId: string,
    vorgang?: string
  ): Observable<ApiStempelzeit> {
    console.log('Creating stempelzeit for person:', personId);
    console.log('vorgang:', vorgang);

    const newStempelzeit = {
      ...dto,
      id: 'MOCK_' + Date.now().toString(),
      version: 1
    };

    return of(newStempelzeit).pipe(
      delay(this.apiDelay),
      map(created => {
        console.log('Stempelzeit created (MOCK) with id:', created.id);
        return created;
      })
    );
  }

  updateStempelzeit(
    dto: ApiStempelzeit,
    id: string,
    vorgang?: string | boolean
  ): Observable<ApiStempelzeit> {
    console.log('Updating stempelzeit:', id);
    console.log('vorgang:', vorgang);
    if (vorgang === true) {
      return this.createStempelzeit(dto, id);
    }

    return of(dto).pipe(
      delay(this.apiDelay),
      map(updated => {
        console.log('Stempelzeit updated (MOCK)');
        return updated;
      })
    );
  }

  deleteStempelzeit(
    dto: ApiStempelzeit,
    id: string,
    vorgang?: string
  ): Observable<void> {
    console.log('Deleting stempelzeit for person:', id);
    console.log('vorgang:', vorgang);
    console.log('Stempelzeit to delete:', dto);

    return of(void 0).pipe(
      delay(this.apiDelay),
      map(() => {
        console.log('Stempelzeit deleted (MOCK)');
      })
    );
  }

  getStempelzeitenById(id: string): Observable<any> {
    return this.http.get<any>(this.detailUrl).pipe();
  }

  getStempelzeiten(): Observable<any[]> {
    return this.http.get<any[]>(this.listUrl).pipe();
  }

  private listUrl2 = "stempelzeit-list.json"
  private detailUrl2 = "zivildiener-details.json"

  getZivildiener(): Observable<any[]> {
    return this.http.get<any[]>(this.listUrl2).pipe();
  }

  getZivildienerById(id: string): Observable<any> {
    return this.http.get<any>(this.detailUrl2).pipe();
  }

  //////////////organization////////

  private selectedOrganizationSubject = new BehaviorSubject<Datalistorganizationanc | null>(null);
  selectedOrganization$ = this.selectedOrganizationSubject.asObservable();

  setSelectedOrganization(org: Datalistorganizationanc) {
    this.selectedOrganizationSubject.next(org);
  }

  getSelectedOrganization(): Observable<Datalistorganizationanc | null> {
    return this.selectedOrganization$;
  }

  clearSelectedOrganization(): void {
    this.selectedOrganizationSubject.next(null);
  }
}
