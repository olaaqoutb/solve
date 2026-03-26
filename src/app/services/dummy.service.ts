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
import { ApiAbschlussInfo } from '../models-2/ApiAbschlussInfo';
import { ApiTaetigkeitsbuchung } from '../models-2/ApiTaetigkeitsbuchung';
import { ApiPersonenvermerk } from '../models-2/ApiPersonenvermerk';
import{ApiVertragPosition}  from "../models-2/ApiVertragPosition";
import{ApiVertragPositionVerbraucher} from "../models-2/ApiVertragPositionVerbraucher";
import{ApiStundenplanung}from "../models-2/ApiStundenplanung";
import { ApiRollenbezeichnungsListe } from '../models-2/ApiRollenbezeichnungsListe';
import { ApiGeschaeftszahlenListe } from '../models-2/ApiGeschaeftszahlenListe';
import { StempelzeitDto } from '../models/person';
import {  throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DummyService {

  ///////// Personen Component ///////////////
  private readonly json1 = '1_json_person_detail_response_1750153663701.json';
  // private readonly json2 = '/1_json_person_detail_response_1750153663701.json';
  private personenVertrage="/1_json_person_detail_response_2.json"
  private  newperson="request_berechneteStunden.json"
  private readonly json3 = '/json_personen_list.json';
  private readonly abwesenheitKorrigieren='abwesenheit-korrigieren.json';
  private readonly apiDelay = 500;
private readonly json4 = '/bereitschaft-korrigieren-2.json';
  ///////// Stempelzeiten Component ///////////////
  private listUrl = "stempelzeit-list.json"
  private detailUrl = "stempelzeit-details.json"
  private detail2 = "zivildiener-details.json"
private info2="request_abschluss_info.json"
private rollenVertrage="rollenbezeichnung_vertrage.json"
  ///////// Products JSON - NEW! ///////////////
  private produkteUrl = "produckts_details.json"  // Add your products JSON file name here
private produkteUrlFiltered = "request_product_filter.json"
private produkteStempFiltered = "Json_produkte-stemp,json"
private ziviStempel="response_details_1754057171119.json"
private stemFiltered = 'request_stempelzeiten.json';
private buchSyempel="1_test_hassan_stempelzeiten.json"
 private produkteUrl2 = "json_produkte_1-hist.json"  // Add your products JSON file name here
private info="json_info_1.json"
private  stem='json_stempelzeiten_1.json'
private stempelzeiten='json_details_Update_2026.json'
private stempelzeitenInfo="stempel_info.json"
private geschaeftszahlen_vertrage=""
private personenPerson="1_json_details_hassan.json"
private abwesent="/abwesenheit_list.json"
  constructor(private http: HttpClient) { }

  ///////////////////////////////// Personen Component ////////////////////////////////////////
log(){
  console.log("this is your json file:", this.stem)
}
  getPerson(
    id: string,
    persondetail?: string,
     berechneteStunden: boolean = false,
    addVertraege?: boolean
  ): Observable<ApiPerson> {

  return this.http.get<ApiPerson>(this.json1);
  }
  getPerson1(
    id: string,
    persondetail?: string,
     berechneteStunden: boolean = false,
    addVertraege?: boolean
  ): Observable<ApiPerson> {

  return this.http.get<ApiPerson>(this.newperson);
  }

////////////////////////////////////PERSONEN///////////////////////////

  getPerson2(  id: string,
  persondetail?: string,
  berechneteStunden?: boolean,
  addVertraege?: boolean
): Observable<ApiPerson> {
return this.http.get<any>(this.personenPerson)
}
getPersonGeplantGebucht1(
  parentId: string,
  positionIdStr?: string,
  planungsjahrStr?: string
): Observable<ApiGeplantGebucht> {
  return of({ geplant: 9000 } as ApiGeplantGebucht);
}
getAlleAktuellenLeistungskategorien2(): Observable<ApiLeistungskategorien> {
  return of({"leistungskategorie":["","4-1","4-2","A01","Fakt-1","Fakt-2","LK 1","MT01"]})
}

//////////////////////////////////////////////////////////////
  getPersonenn(
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

  getPersonen(berechneteStunden?: string,
  nurNamen?: string,
  funktion?: string): Observable<ApiPerson[]> {
    const params = new URLSearchParams();
    if(berechneteStunden!==undefined){
    params.append('berechneteStunden', berechneteStunden.toString());
    }
    if(nurNamen!==undefined){
    params.append('nurNamen', nurNamen.toString());
    }
    // if(funktion!==undefined){
    // params.append('funktion', funktion.toString());
    // }


  const queryString = params.toString();
  const path = queryString ? `${this.listUrl}?${queryString}` : this.listUrl;

  return this.http.get<ApiPerson[]>(path).pipe(
    // delay(this.apiDelay),
    // map(data => {
    //   console.log('Persons loaded from JSON (mock):', data.length);
    //   return data;
    // })
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

  getPersonProdukte(
    personId: string,
    filter?: string,
    taetigkeitenAb?: string,
    taetigkeitenBis?: string,
    planungsjahr?: string
  ): Observable<ApiProdukt[]> {
    const url=filter?this.produkteUrlFiltered:this.produkteUrl
    return this.http.get<ApiProdukt[]>(url)
  }
   getPersonProdukte1(
    personId: string,
    filter?: string,
    taetigkeitenAb?: string,
    taetigkeitenBis?: string,
    planungsjahr?: string
  ): Observable<ApiProdukt[]> {
    const url=filter?this.produkteStempFiltered:this.produkteUrl
    return this.http.get<ApiProdukt[]>(url)
  }
  getPersonProdukte2(
    personId: string,
    filter?: string,
    taetigkeitenAb?: string,
    taetigkeitenBis?: string,
    planungsjahr?: string
  ): Observable<ApiProdukt[]> {
    // console.log("Loading products for person:", personId);
    // console.log("parameters:", { filter, taetigkeitenAb, taetigkeitenBis });

    // Load from the products JSON file
    return this.http.get<ApiProdukt[]>(this.produkteUrl2).pipe(
      // delay(this.apiDelay),
      // map(products => {
      //   if (Array.isArray(products)) {
      //     console.log("Products loaded from JSON:", products.length);
      //     return products;
      //   } else {
      //     console.log("Products data is not an array");
      //     return [];
      //   }
      // })
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
  loginBis?: string,
  ): Observable<ApiStempelzeit[]> {

  return this.http.get<any>(this.stem);
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
    vorgang?: string
  ): Observable<ApiStempelzeit> {
    console.log('Updating stempelzeit:', id);
    console.log('vorgang:', vorgang);
    // if (vorgang === true) {
    //   return this.createStempelzeit(dto, id);
    // }

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

//////////////////////////////////////Bereitschaft///////////////////////
  getPersonStempelzeitenNoAbwesenheit (
    personId: string,
    loginAb?: string,
    loginBis?: string
  ): Observable<ApiStempelzeit[]> {
    console.log('Loading stempelzeiten for person:', personId);
    console.log('parameters:', { loginAb, loginBis });

    return this.http.get<any>(this.stem)
    .pipe(
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
 getPersonStempelzeitenNoAbwesenheit1 (
    personId: string,
    loginAb?: string,
    loginBis?: string
  ): Observable<ApiStempelzeit[]> {
    console.log('Loading stempelzeiten for person:', personId);
    console.log('parameters:', { loginAb, loginBis });

    return this.http.get<any>(this.stemFiltered).pipe(
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
   getPersonStempelzeitenNoAbwesenheit2 (
    personId: string,
    loginAb?: string,
    loginBis?: string
  ): Observable<ApiStempelzeit[]> {
    // console.log('Loading stempelzeiten for person:', personId);
    // console.log('parameters:', { loginAb, loginBis });

    return this.http.get<any>(this.stempelzeiten)
    // .pipe(
    //   delay(this.apiDelay),
    //   map(data => {
    //     if (Array.isArray(data)) {
    //       console.log('Stempelzeiten loaded from JSON:', data.length);
    //       return data;
    //     } else if (data && typeof data === 'object') {
    //       const extracted = data.stempelzeiten ||
    //         data.timeEntries ||
    //         data.content ||
    //         [];
    //       console.log('Stempelzeiten loaded from JSON (nested):', extracted.length);
    //       return extracted;
    //     }
    //     console.log('Stempelzeiten loaded from JSON: empty');
    //     return [];
    //   })
    // );
  }
 getPersonStempelzeitenNoAbwesenheit3(
  parentId: string,
  loginAb?: string,
  loginBis?: string
): Observable<ApiStempelzeit[]> {
    return this.http.get<any>(this.ziviStempel)
  }
 getPersonStempelzeitenNoAbwesenheit4 (
    personId: string,
    loginAb?: string,
    loginBis?: string
  ): Observable<ApiStempelzeit[]> {
    console.log('Loading stempelzeiten for person:', personId);
    console.log('parameters:', { loginAb, loginBis });

    return this.http.get<any>(this.buchSyempel).pipe(
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
  private data: ApiStempelzeit[] = [];

createBereitschaft(
  personIdStr: string,
  dto: ApiStempelzeit,
  vorgangStr?:string

): Observable<ApiStempelzeit[]> {
    this.data.push(dto);
    return of(this.data);
  }

deleteBereitschaft(id: string): Observable<void> {
  this.data = this.data.filter(
    x => `${x.login}-${x.logoff}` !== id
  );
  return of(void 0);
}



getPersonAbschlussInfo(personIdStr: string): Observable<ApiAbschlussInfo> {

  // const dummyData: ApiAbschlussInfo = {
  //   naechsterBuchbarerTag: '2026-01-23',
  //   naechsterTagesabschlussAufheben: '2026-01-24',
  //   letzterMonatsabschluss: '2025-12-31',
  //   letzterGlobalerMonatsabschluss: '2025-12-31',
  //   ersteBuchung: '2025-01-01'
  // };

  // return of(dummyData);
return this.http.get<any>(this.info2)
}
getPersonAbschlussInfo1(personIdStr: string): Observable<ApiAbschlussInfo> {

return this.http.get<any>(this.stempelzeitenInfo)
}
  ////////////////////////Abwesenheit korrigieren//////////

getStempelzeit(
  personIdStr?: string,
  zeitTypStr?: string,
  loginAb?: string
): Observable<ApiStempelzeit[]> {

  return this.http
    .get<ApiStempelzeit[]>(this.abwesenheitKorrigieren)
    // .pipe(
    //   map(data => {
    //     return data;
    //   }),
    //   delay(this.apiDelay)
    // );
}
  //////////////////////////////////tatigkeiten////////////////////////
  abschlussInfo(personId: string): Observable<ApiAbschlussInfo> {
    // console.log('DummyService: abschlussInfo called for', personId);

return this.http.get<ApiAbschlussInfo>(this.info)

  }
  ////////////////////////////////////////
  createTaetigkeitsbuchung(
  dto: ApiTaetigkeitsbuchung,
  produktPositionBuchungspunktId: string,
  personId: string,
  vorgang?: string
): Observable<ApiTaetigkeitsbuchung> {
  console.log('Creating Taetigkeitsbuchung (MOCK)');
  const mockResponse: ApiTaetigkeitsbuchung = {
    ...dto,
    stempelzeit: {
      ...dto.stempelzeit,
      id: 'MOCK_' + Date.now().toString(),

    }
  };
  return of(mockResponse).pipe(delay(500));
}

updateTaetigkeitsbuchung(
  id: string,
  dto: ApiTaetigkeitsbuchung,
  vorgang?: string
): Observable<ApiTaetigkeitsbuchung> {
  console.log('Updating/Deleting Taetigkeitsbuchung (MOCK)', vorgang);
  return of(dto).pipe(delay(500));
}



getPersonVermerke(
  parentId: string,
  ab: string,
  bis: string
): Observable<ApiPersonenvermerk[]> {
  return of([]);  // empty array for now
}






private personenDropdown='1_json_personen_dropdownlist_response_1750678828410.json';
private vertrageDetailUrl='vertrag_details2.json';
 private vertrageList="1_json_vertrag_list_response.json"
// getVertraegeVerantwortlicher1(): Observable<ApiVertrag[]> {
//   return this.http.get<any>(this.vertrageDetailUrl)
// }

  // getVertrageDetails(): Observable<any> {
  //   return this.http.get<any>(this.vertrageList)
  // }

  getPersonen1(berechneteStunden?: string,
  nurNamen?: string,
  funktion?: string): Observable<ApiPerson[]> {  return this.http.get<any[]>(this.personenDropdown);
}
getVertrag(
  id: string,
  berechneteStunden?: boolean
): Observable<ApiVertrag> {
    return this.http.get<any>(this.vertrageDetailUrl)

}



  // ========================================
  // VERTRAG MOCK ENDPOINTS
  // ========================================

  // createVertrag(vertrag: ApiVertrag): Observable<ApiVertrag> {
  //   console.log("Creating vertrag (MOCK)");

  //   // Create a real class instance and copy data into it
  //   const newVertrag = new ApiVertrag();
  //   Object.assign(newVertrag, vertrag);
  //   newVertrag.id = 'MOCK_VERTRAG_' + Date.now().toString();

  //   return of(newVertrag).pipe(
  //     delay(this.apiDelay),
  //     map(createdVertrag => {
  //       console.log("Created mock vertrag with id:", createdVertrag.id);
  //       return createdVertrag;
  //     })
  //   );
  // }
  updateVertrag(id: string, vertrag: ApiVertrag): Observable<ApiVertrag> {
    return of(vertrag)
  }

  createVertragPosition(position: ApiVertragPosition, vertragId: string): Observable<ApiVertragPosition> {
    const newPosition = new ApiVertragPosition();
    Object.assign(newPosition, position);
    newPosition.id = 'MOCK_POS_' + Date.now().toString();
    return of(newPosition)
  }
  updateVertragPosition(id: string, position: ApiVertragPosition): Observable<ApiVertragPosition> {
    return of(position)
  }



createVertragPositionVerbraucher(
  position: ApiVertragPositionVerbraucher,
  vertragPositionId: string
): Observable<ApiVertragPositionVerbraucher> {
  const newVerbraucher = new ApiVertragPositionVerbraucher(); // ← was wrong class
  Object.assign(newVerbraucher, position);
  newVerbraucher.id = 'MOCK_VERB_' + Date.now().toString();
  return of(newVerbraucher);
}

updateVertragPositionVerbraucher(
  id: string,
  position: ApiVertragPositionVerbraucher
): Observable<ApiVertragPositionVerbraucher> {
  return of(position);
}

updateStundenplanung(
  id: string,
  object: ApiStundenplanung
): Observable<ApiStundenplanung> {
  return of(object);
}

createStundenplanung(
  object: ApiStundenplanung,
  produktPositionId: string,
  verbraucherId: string
): Observable<ApiStundenplanung> {
  const newPlan = new ApiStundenplanung();
  Object.assign(newPlan, object);
  newPlan.id = 'MOCK_PLAN_' + Date.now().toString();
  return of(newPlan);
}
 getVertraegeVerantwortlicher2(): Observable<ApiVertrag[]> {
  return this.http.get<any>(this.personenVertrage)
}


getVertraege(
  berechneteStunden?: boolean,
  verbraucheStunden?: boolean
): Observable<ApiVertrag[]> {
  return this.http.get<any>(this.vertrageList)
}
getAlleAktuellenRollenbezeichnungen(): Observable<ApiRollenbezeichnungsListe> {
  return this.http.get<any>(this.rollenVertrage)
}
getAlleAktuellenGeschaeftszahlen(): Observable<ApiGeschaeftszahlenListe> {
  const data:any = {
    geschaeftszahl: ["333VV", "333VV-CC", "RV-001", "RV-9876"]
  };
  return of(data);
}
createVertrag(vertrag: ApiVertrag): Observable<ApiVertrag> {
  const newVertrag = new ApiVertrag();
  Object.assign(newVertrag, vertrag);
  newVertrag.id = 'MOCK_VERTRAG_' + Date.now().toString();
  return of(newVertrag).pipe(delay(this.apiDelay));
}

getAbwesenheitsListe(): Observable<StempelzeitDto[]> {
    return this.http.get<StempelzeitDto[]>(this.abwesent);
  }
   private dummyData: StempelzeitDto[] = [
    {
      id: '477200000000327',
      version: 14,
      deleted: false,
      login: '2026-04-02T04:00:00.000',
      logoff: '2026-04-02T11:01:00.000',
      anmerkung: 'TESSTT 1122',
      zeitTyp: 'ABWESENHEIT',
      poKorrektur: true,
      marker: [],
      eintragungsart: 'NORMAL',
      loginSystem: '',
      logoffSystem: ''
    },
    {
      id: '475800000001083',
      version: 4,
      deleted: false,
      login: '2026-04-05T00:00:00.000',
      logoff: '2026-04-07T05:04:00.000',
      anmerkung: 'TEST BBB',
      zeitTyp: 'ABWESENHEIT',
      poKorrektur: true,
      marker: [],
      eintragungsart: 'NORMAL',
      loginSystem: '',
      logoffSystem: ''
    },
    {
      id: '475800000001133',
      version: 1,
      deleted: false,
      login: '2026-04-08T09:00:00.000',
      logoff: '2026-04-08T17:00:00.000',
      anmerkung: 'TEST',
      zeitTyp: 'ABWESENHEIT',
      poKorrektur: true,
      marker: [],
      eintragungsart: 'NORMAL',
      loginSystem: '',
      logoffSystem: ''
    },
    {
      id: '475800000001137',
      version: 1,
      deleted: false,
      login: '2026-04-12T09:00:00.000',
      logoff: '2026-05-13T17:00:00.000',
      anmerkung: 'testtttt',
      zeitTyp: 'ABWESENHEIT',
      poKorrektur: true,
      marker: [],
      eintragungsart: 'NORMAL',
      loginSystem: '',
      logoffSystem: ''
    },
    {
      id: '475800000001210',
      version: 2,
      deleted: false,
      login: '2026-05-15T09:00:00.000',
      logoff: '2026-05-15T19:04:00.000',
      anmerkung: 'TEE',
      zeitTyp: 'ABWESENHEIT',
      poKorrektur: true,
      marker: [],
      eintragungsart: 'NORMAL',
      loginSystem: '',
      logoffSystem: ''
    },
    {
      id: '475800000001214',
      version: 1,
      deleted: false,
      login: '2026-05-16T09:00:00.000',
      logoff: '2026-05-16T17:00:00.000',
      anmerkung: 'test',
      zeitTyp: 'ABWESENHEIT',
      poKorrektur: true,
      marker: [],
      eintragungsart: 'NORMAL',
      loginSystem: '',
      logoffSystem: ''
    }
  ];

  // Counter for generating new IDs (mimics backend ID generation)
  private nextIdSuffix = 1300;

  // constructor() {}

  // getAbwesenheitsListe(): Observable<StempelzeitDto[]> {
  //   const active = this.dummyData.filter(item => !item.deleted);
  //   return of([...active]).pipe(delay(300));
  // }

  createAbwesenheit(stempelzeitDto: StempelzeitDto): Observable<any> {
    const newItem: StempelzeitDto = {
      ...stempelzeitDto,
      id: `47580000000${this.nextIdSuffix++}`,  // Mimic real ID format
      version: 1,
      deleted: false
    };

    this.dummyData.push(newItem);

    // Match the HttpResponse shape your component reads:
    // response.body, response.status, response.headers
    const mockResponse = {
      body: newItem,
      status: 200,
      headers: {}
    };

    return of(mockResponse).pipe(delay(300));
  }

  editAbwesenheit(stempelzeitDto: StempelzeitDto): Observable<any> {
    const index = this.dummyData.findIndex(item => item.id === stempelzeitDto.id);

    if (index === -1) {
      return throwError(() => ({
        status: 400,
        error: `Eintrag mit ID ${stempelzeitDto.id} wurde nicht gefunden.`
      }));
    }

    // Bump version like a real backend would on update
    this.dummyData[index] = {
      ...stempelzeitDto,
      version: (this.dummyData[index].version || 1) + 1
    };

    const mockResponse = {
      body: this.dummyData[index],
      status: 200,
      headers: {}
    };

    return of(mockResponse).pipe(delay(300));
  }

  deleteAbwesenheit(stempelzeitDto: StempelzeitDto): Observable<any> {
    const index = this.dummyData.findIndex(item => item.id === stempelzeitDto.id);

    if (index === -1) {
      return throwError(() => ({
        status: 400,
        error: `Eintrag mit ID ${stempelzeitDto.id} wurde nicht gefunden.`
      }));
    }

    // Soft delete — sets deleted: true, matching what the component sends
    this.dummyData[index] = { ...stempelzeitDto, deleted: true };

    // Return remaining active items, matching Observable<StempelzeitDto[]>
    return of(this.dummyData.filter(item => !item.deleted)).pipe(delay(300));
  }
}
