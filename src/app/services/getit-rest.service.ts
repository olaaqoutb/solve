export const PathConst = {
  PERSONEN: 'personen',
  ORGANISATIONSEINHEITEN: 'organisationseinheiten',
  VERTRAEGE: 'vertraege',
  VERTRAG_POSITIONEN: 'vertragPositionen',
  VERTRAG_POSITION_VERBRAUCHER: 'vertragPositionVerbraucher',
  PRODUKTE: 'produkte',
  PRODUKT_POSITIONEN: 'produktPositionen',
  PRODUKT_POSITIONEN_BUCHUNGSPUNKTE: 'produktPositionBuchungspunkte',
  STUNDENPLANUNG: 'stundenplanung',
  TAETIGKEITSBUCHUNGEN: 'taetigkeitsbuchungen',
  STEMPELZEITEN: 'stempelzeiten',
  PERSONENVERMERKE: 'personenvermerke',
  FREIGABE_POSITIONEN: 'freigabePositionen',
  FREIGABE_GRUPPEN: 'freigabeGruppen',
  BEREITSCHAFT: 'bereitschaft',
  ZIVI_URLAUBKRANK: 'ziviUrlaubKrank',
  INFO: 'info',
  ME: 'me',
  ABSCHLUSS_TAG: 'abschluss/tag',
  ABSCHLUSS_MONAT: 'abschluss/monat',
  ABSCHLUSS_INFO: 'abschluss/info',
  TEAMZUORDNUNGEN: 'teamzuordnungen',
  LEISTUNGSKATEGORIEN: 'leistungskategorien',
  VERTRAGSPARTNER: 'vertragspartner',
  GESCHAEFZSZAHLEN: 'geschaeftszahlen',
  ROLLENBEZEICHNUNGEN: 'rollenbezeichnungen',
  FEIERTAGE: 'feiertage',
  INFOPDF_MUSSLESEN: 'infopdf/musslesen',
  INFOPDF_HATGELESEN: 'infopdf/hatgelesen',
  GEPLANT_GEBUCHT: 'geplantGebucht',
  PERSONENVERANTWORTLICHE: 'personenverantwortliche',
  DURCHFUEHRUNGSVERANTWORTLICHER: 'durchfuehrungsverantwortlicher',
  ID: 'id',
  PARENT_ID: 'parentId',
  DATUM: 'datum',
  RESET: 'reset',
  DISABLE: 'disable',
  RESET_AND_COPY: 'resetAndCopy',
  STEMPELN: 'stempeln',
  ANZAHL: '/anzahl',

  FREIGABE_POSITIONEN_ANZAHL: 'freigabePositionen/anzahl',
  FREIGABE_POSITIONEN_HISTORY: 'freigabePositionen/history',
  VERTRAEGE_VERTRAGSVERANTWORTLICHER: 'vertraege/vertragsverantwortlicher',
  PERSONEN_DURCHFUEHRUNGSVERANTWORTLICHER: 'personen/durchfuehrungsverantwortlicher'
} as const;

//export const ANZAHL = "/anzahl";
//export const HISTORY = "/history";


//export const FREIGABE_POSITIONEN_ANZAHL = PathConst.FREIGABE_POSITIONEN + ANZAHL;
//export const FREIGABE_POSITIONEN_HISTORY = PathConst.FREIGABE_POSITIONEN + HISTORY;

export const QueryConst = {
  PERSONDETAILGRAD: 'persondetail',
  BERECHNETE_STUNDEN: 'berechneteStunden',
  ADD_VERTRAEGE: 'addVertraege',
  NUR_NAMEN: 'nurNamen',
  FILTER: 'filter',
  TAETIGKEITEN_AB: 'taetigkeitenAb',
  TAETIGKEITEN_BIS: 'taetigkeitenBis',
  PLANUNGSJAHR: 'planungsjahr',
  LOGIN_AB: 'loginAb',
  LOGIN_BIS: 'loginBis',
  PERSON_ID: 'personId',
  ZEITTYP: 'zeitTyp',
  LOGOFF_AB: 'logoffAb',
  VERBRAUCHTE_STUNDEN: 'verbrauchteStunden',
  VORGANG: 'vorgang',
  VERBRAUCHER: 'verbraucher',
  AUFHEBEN: 'aufheben',
  PRODUKTPOSITION: 'produktPosition',
  ADD_GEBUCHT: 'addGebucht',
  NUR_AKTIV: 'nurAktiv',
  FUNKTION: 'funktion',
  AB: 'ab',
  BIS: 'bis',
  BUCHUNG_ID: 'buchungId',
  JAHR: 'jahr',
  STUNDENSATZ_NEU: 'stundensatzNeu'
} as const;

import { Inject, Injectable } from '@angular/core';
// Adjust path as needed
import { Observable, from } from 'rxjs'


import { ApiPerson } from '../models-2/ApiPerson';
import { ApiStempelzeit } from '../models-2/ApiStempelzeit';
import { ApiOrganisationseinheit } from '../models-2/ApiOrganisationseinheit';
import { ApiVertrag } from '../models-2/ApiVertrag';
import { ApiVertragPosition } from '../models-2/ApiVertragPosition';
import { ApiVertragPositionVerbraucher } from '../models-2/ApiVertragPositionVerbraucher';
import { ApiProdukt } from '../models-2/ApiProdukt';
import { ApiProduktPosition } from '../models-2/ApiProduktPosition';
import { ApiProduktPositionBuchungspunkt } from '../models-2/ApiProduktPositionBuchungspunkt';
import { ApiStundenplanung } from '../models-2/ApiStundenplanung';
import { ApiTaetigkeitsbuchung } from '../models-2/ApiTaetigkeitsbuchung';
import { ApiPersonAnwesenheit } from '../models-2/ApiPersonAnwesenheit';
import { ApiAbschlussInfo } from '../models-2/ApiAbschlussInfo';
import { ApiFeiertage } from '../models-2/ApiFeiertage';
import { ApiInfo } from '../models-2/ApiInfo';
import { ApiGeplantGebucht } from '../models-2/ApiGeplantGebucht';
import { ApiTeamzuordnungen } from '../models-2/ApiTeamzuordnungen';
import { ApiVertragspartnerListe } from '../models-2/ApiVertragspartnerListe';
import { ApiFreigabePosition } from '../models-2/ApiFreigabePosition';
import { ApiFreigabePositionAnzahl } from '../models-2/ApiFreigabePositionAnzahl';
import { ApiPersonenvermerk } from '../models-2/ApiPersonenvermerk';
import { ApiMussPdfLesen } from '../models-2/ApiMussPdfLesen';
import { ApiGeschaeftszahlenListe } from '../models-2/ApiGeschaeftszahlenListe';
import { ApiRollenbezeichnungsListe } from '../models-2/ApiRollenbezeichnungsListe';
import { ApiLeistungskategorien } from '../models-2/ApiLeistungskategorien';

@Injectable({
  providedIn: 'root'
})
export class GetitRestService {

  // private baseUrl: string;

  constructor(@Inject('BASE_URL') private baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private request<T>(path: string, options: RequestInit = {}): Observable<T> {
    const url = `${this.baseUrl}/${path}`;
    const request = fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });

    return from(request);
  }

  // Person methods
  createPerson(person: ApiPerson): Observable<ApiPerson> {
    return this.request<ApiPerson>(PathConst.PERSONEN, {
      method: 'POST',
      body: JSON.stringify(person)
    });
  }

  updatePerson(person: ApiPerson, id: string): Observable<ApiPerson> {
    return this.request<ApiPerson>(`${PathConst.PERSONEN}/${id}`, {
      method: 'POST',
      body: JSON.stringify(person)
    });
  }

  resetPerson(id: string): Observable<ApiPerson> {
    return this.request<ApiPerson>(`${PathConst.PERSONEN}/${id}/${PathConst.RESET}`, {
      method: 'POST'
    });
  }

  disablePortalPerson(id: string): Observable<ApiPerson> {
    return this.request<ApiPerson>(`${PathConst.PERSONEN}/${id}/${PathConst.DISABLE}`, {
      method: 'POST'
    });
  }

  getPerson(id: string, persondetail?: string, berechneteStunden: boolean = false, addVertraege?: boolean): Observable<ApiPerson> {
    const params = new URLSearchParams();
    if (persondetail) params.append(QueryConst.PERSONDETAILGRAD, persondetail);
    params.append(QueryConst.BERECHNETE_STUNDEN, berechneteStunden.toString());
    if (addVertraege !== undefined) params.append(QueryConst.ADD_VERTRAEGE, addVertraege.toString());

    const queryString = params.toString();
    const path = queryString ? `${PathConst.PERSONEN}/${id}?${queryString}` : `${PathConst.PERSONEN}/${id}`;

    return this.request<ApiPerson>(path);
  }

  getPersonWithBerechneteStunden(id: string, berechneteStunden: boolean = false, addVertraege?: boolean): Observable<ApiPerson> {
    const params = new URLSearchParams();
    params.append(QueryConst.BERECHNETE_STUNDEN, berechneteStunden.toString());
    if (addVertraege !== undefined) params.append(QueryConst.ADD_VERTRAEGE, addVertraege.toString());

    const queryString = params.toString();
    const path = queryString ? `${PathConst.PERSONEN}/${id}?${queryString}` : `${PathConst.PERSONEN}/${id}`;

    return this.request<ApiPerson>(path);
  }

  getPersonen(berechneteStunden: boolean = false, nurNamen: boolean = false): Observable<ApiPerson[]> {
    const params = new URLSearchParams();
    params.append(QueryConst.BERECHNETE_STUNDEN, berechneteStunden.toString());
    params.append(QueryConst.NUR_NAMEN, nurNamen.toString());

    const queryString = params.toString();
    const path = queryString ? `${PathConst.PERSONEN}?${queryString}` : PathConst.PERSONEN;

    return this.request<ApiPerson[]>(path);
  }

  getAnwesenheit(): Observable<ApiPersonAnwesenheit[]> {
    return this.request<ApiPersonAnwesenheit[]>(`${PathConst.PERSONEN}:anwesend`);
  }

  getPersonProdukte(
    personId: string,
    filter?: string,
    taetigkeitenAb?: string,
    taetigkeitenBis?: string,
    planungsjahr?: string
  ): Observable<ApiProdukt[]> {
    const params = new URLSearchParams();
    if (filter) params.append(QueryConst.FILTER, filter);
    if (taetigkeitenAb) params.append(QueryConst.TAETIGKEITEN_AB, taetigkeitenAb);
    if (taetigkeitenBis) params.append(QueryConst.TAETIGKEITEN_BIS, taetigkeitenBis);
    if (planungsjahr) params.append(QueryConst.PLANUNGSJAHR, planungsjahr);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${personId}/${PathConst.PRODUKTE}?${queryString}`
      : `${PathConst.PERSONEN}/${personId}/${PathConst.PRODUKTE}`;

    return this.request<ApiProdukt[]>(path);
  }

  getPersonStempelzeiten(
    personId: string,
    loginAb?: string,
    loginBis?: string
  ): Observable<ApiStempelzeit[]> {
    const params = new URLSearchParams();
    if (loginAb) params.append(QueryConst.LOGIN_AB, loginAb);
    if (loginBis) params.append(QueryConst.LOGIN_BIS, loginBis);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${personId}/${PathConst.STEMPELZEITEN}?${queryString}`
      : `${PathConst.PERSONEN}/${personId}/${PathConst.STEMPELZEITEN}`;

    return this.request<ApiStempelzeit[]>(path);
  }

  // NEW: Get person stempelzeiten WITHOUT absence entries (Ohne Abwesenheit)
  // As requested by senior developer
  getPersonStempelzeitenOhneAbwesenheit(
    personId: string,
    loginAb?: string,
    loginBis?: string
  ): Observable<ApiStempelzeit[]> {
    const params = new URLSearchParams();
    if (loginAb) params.append(QueryConst.LOGIN_AB, loginAb);
    if (loginBis) params.append(QueryConst.LOGIN_BIS, loginBis);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${personId}/${PathConst.STEMPELZEITEN}?${queryString}`
      : `${PathConst.PERSONEN}/${personId}/${PathConst.STEMPELZEITEN}`;

    return this.request<ApiStempelzeit[]>(path);
  }


  getPersonMeStempelzeiten(loginAb?: string): Observable<ApiStempelzeit[]> {
    const params = new URLSearchParams();
    if (loginAb) params.append(QueryConst.LOGIN_AB, loginAb);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${PathConst.ME}/${PathConst.STEMPELZEITEN}?${queryString}`
      : `${PathConst.PERSONEN}/${PathConst.ME}/${PathConst.STEMPELZEITEN}`;

    return this.request<ApiStempelzeit[]>(path);
  }

  createStempelzeit(dto: ApiStempelzeit, personId: string, vorgang?: string): Observable<ApiStempelzeit> {
    const params = new URLSearchParams();
    if (vorgang) params.append(QueryConst.VORGANG, vorgang);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${personId}/${PathConst.STEMPELZEITEN}?${queryString}`
      : `${PathConst.PERSONEN}/${personId}/${PathConst.STEMPELZEITEN}`;

    return this.request<ApiStempelzeit>(path, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  updateStempelzeit(dto: ApiStempelzeit, id: string, vorgang?: string): Observable<ApiStempelzeit> {
    const params = new URLSearchParams();
    if (vorgang) params.append(QueryConst.VORGANG, vorgang);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.STEMPELZEITEN}/${id}?${queryString}`
      : `${PathConst.STEMPELZEITEN}/${id}`;

    return this.request<ApiStempelzeit>(path, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  getStempelzeit(
    personIdStr?: string,
    zeitTypStr?: string,
    loginAb?: string
  ): Observable<ApiStempelzeit[]> {
    const params = new URLSearchParams();
    if (personIdStr) params.append(QueryConst.PERSON_ID, personIdStr);
    if (zeitTypStr) params.append(QueryConst.ZEITTYP, zeitTypStr);
    if (loginAb) params.append(QueryConst.LOGIN_AB, loginAb);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.STEMPELZEITEN}?${queryString}`
      : PathConst.STEMPELZEITEN;

    return this.request<ApiStempelzeit[]>(path);
  }

  getAbwesenheiten(
    personIdStr?: string,
    zeitTypStr?: string,
    logoffAb?: string
  ): Observable<ApiStempelzeit[]> {
    const params = new URLSearchParams();
    if (personIdStr) params.append(QueryConst.PERSON_ID, personIdStr);
    if (zeitTypStr) params.append(QueryConst.ZEITTYP, zeitTypStr);
    if (logoffAb) params.append(QueryConst.LOGOFF_AB, logoffAb);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.STEMPELZEITEN}?${queryString}`
      : PathConst.STEMPELZEITEN;

    return this.request<ApiStempelzeit[]>(path);
  }

  // Organisationseinheit methods
  createOrganisationseinheit(organisationseinheit: ApiOrganisationseinheit): Observable<ApiOrganisationseinheit> {
    return this.request<ApiOrganisationseinheit>(PathConst.ORGANISATIONSEINHEITEN, {
      method: 'POST',
      body: JSON.stringify(organisationseinheit)
    });
  }

  updateOrganisationseinheit(organisationseinheit: ApiOrganisationseinheit, id: string): Observable<ApiOrganisationseinheit> {
    return this.request<ApiOrganisationseinheit>(`${PathConst.ORGANISATIONSEINHEITEN}/${id}`, {
      method: 'POST',
      body: JSON.stringify(organisationseinheit)
    });
  }

  getOrganisationsEinheiten(): Observable<ApiOrganisationseinheit[]> {
    return this.request<ApiOrganisationseinheit[]>(PathConst.ORGANISATIONSEINHEITEN);
  }

  // Vertrag methods
  getVertraege(berechneteStunden: boolean = false, verbraucheStunden: boolean = false): Observable<ApiVertrag[]> {
    const params = new URLSearchParams();
    params.append(QueryConst.BERECHNETE_STUNDEN, berechneteStunden.toString());
    params.append(QueryConst.VERBRAUCHTE_STUNDEN, verbraucheStunden.toString());

    const queryString = params.toString();
    const path = queryString ? `${PathConst.VERTRAEGE}?${queryString}` : PathConst.VERTRAEGE;

    return this.request<ApiVertrag[]>(path);
  }

  getVertrag(id: string, berechneteStunden: boolean = false): Observable<ApiVertrag> {
    const params = new URLSearchParams();
    params.append(QueryConst.BERECHNETE_STUNDEN, berechneteStunden.toString());

    const queryString = params.toString();
    const path = queryString ? `${PathConst.VERTRAEGE}/${id}?${queryString}` : `${PathConst.VERTRAEGE}/${id}`;

    return this.request<ApiVertrag>(path);
  }

  createVertrag(vertrag: ApiVertrag): Observable<ApiVertrag> {
    return this.request<ApiVertrag>(PathConst.VERTRAEGE, {
      method: 'POST',
      body: JSON.stringify(vertrag)
    });
  }

  updateVertrag(vertrag: ApiVertrag, id: string): Observable<ApiVertrag> {
    return this.request<ApiVertrag>(`${PathConst.VERTRAEGE}/${id}`, {
      method: 'POST',
      body: JSON.stringify(vertrag)
    });
  }

  // Vertrag Position methods
  createVertragPosition(position: ApiVertragPosition, vertragId: string): Observable<ApiVertragPosition> {
    return this.request<ApiVertragPosition>(`${PathConst.VERTRAEGE}/${vertragId}/${PathConst.VERTRAG_POSITIONEN}`, {
      method: 'POST',
      body: JSON.stringify(position)
    });
  }

  updateVertragPosition(position: ApiVertragPosition, id: string): Observable<ApiVertragPosition> {
    return this.request<ApiVertragPosition>(`${PathConst.VERTRAG_POSITIONEN}/${id}`, {
      method: 'POST',
      body: JSON.stringify(position)
    });
  }

  resetVertragPosition(id: string): Observable<ApiVertragPosition> {
    return this.request<ApiVertragPosition>(`${PathConst.VERTRAG_POSITIONEN}/${id}/${PathConst.RESET}`, {
      method: 'POST'
    });
  }

  createVertragPositionVerbraucher(position: ApiVertragPositionVerbraucher, vertragPositionId: string): Observable<ApiVertragPositionVerbraucher> {
    return this.request<ApiVertragPositionVerbraucher>(`${PathConst.VERTRAG_POSITIONEN}/${vertragPositionId}/${PathConst.VERTRAG_POSITION_VERBRAUCHER}`, {
      method: 'POST',
      body: JSON.stringify(position)
    });
  }

  updateVertragPositionVerbraucher(position: ApiVertragPositionVerbraucher, id: string): Observable<ApiVertragPositionVerbraucher> {
    return this.request<ApiVertragPositionVerbraucher>(`${PathConst.VERTRAG_POSITION_VERBRAUCHER}/${id}`, {
      method: 'POST',
      body: JSON.stringify(position)
    });
  }

  resetAndCopyVertragPositionVerbraucher(position: ApiVertragPositionVerbraucher, id: string, stundensatzNeu?: string): Observable<ApiVertragPositionVerbraucher> {
    const params = new URLSearchParams();
    if (stundensatzNeu) params.append(QueryConst.STUNDENSATZ_NEU, stundensatzNeu);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.VERTRAG_POSITION_VERBRAUCHER}/${id}/${PathConst.RESET_AND_COPY}?${queryString}`
      : `${PathConst.VERTRAG_POSITION_VERBRAUCHER}/${id}/${PathConst.RESET_AND_COPY}`;

    return this.request<ApiVertragPositionVerbraucher>(path, {
      method: 'POST',
      body: JSON.stringify(position)
    });
  }

  // Produkt methods
  getProdukte(filter?: string): Observable<ApiProdukt[]> {
    const params = new URLSearchParams();
    if (filter) params.append(QueryConst.FILTER, filter);

    const queryString = params.toString();
    const path = queryString ? `${PathConst.PRODUKTE}?${queryString}` : PathConst.PRODUKTE;

    return this.request<ApiProdukt[]>(path);
  }

  getProdukt(id: string, filter?: string): Observable<ApiProdukt> {
    const params = new URLSearchParams();
    if (filter) params.append(QueryConst.FILTER, filter);

    const queryString = params.toString();
    const path = queryString ? `${PathConst.PRODUKTE}/${id}?${queryString}` : `${PathConst.PRODUKTE}/${id}`;

    return this.request<ApiProdukt>(path);
  }

  createProdukt(produkt: ApiProdukt): Observable<ApiProdukt> {
    return this.request<ApiProdukt>(PathConst.PRODUKTE, {
      method: 'POST',
      body: JSON.stringify(produkt)
    });
  }

  updateProdukt(produkt: ApiProdukt, id: string): Observable<ApiProdukt> {
    return this.request<ApiProdukt>(`${PathConst.PRODUKTE}/${id}`, {
      method: 'POST',
      body: JSON.stringify(produkt)
    });
  }

  // Additional methods would follow the same pattern...

  getStundenplanungByVerbraucher(id: string): Observable<ApiStundenplanung[]> {
    return this.request<ApiStundenplanung[]>(`${PathConst.VERTRAG_POSITION_VERBRAUCHER}/${id}`);
  }

  getStundenplanung(id: string): Observable<ApiStundenplanung> {
    return this.request<ApiStundenplanung>(`${PathConst.STUNDENPLANUNG}/${id}`);
  }

  createStundenplanung(object: ApiStundenplanung, produktPositionId: string, verbraucherId?: string): Observable<ApiStundenplanung> {
    const params = new URLSearchParams();
    if (verbraucherId) params.append(QueryConst.VERBRAUCHER, verbraucherId);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PRODUKT_POSITIONEN}/${produktPositionId}/${PathConst.STUNDENPLANUNG}?${queryString}`
      : `${PathConst.PRODUKT_POSITIONEN}/${produktPositionId}/${PathConst.STUNDENPLANUNG}`;

    return this.request<ApiStundenplanung>(path, {
      method: 'POST',
      body: JSON.stringify(object)
    });
  }

  updateStundenplanung(object: ApiStundenplanung, id: string): Observable<ApiStundenplanung> {
    return this.request<ApiStundenplanung>(`${PathConst.STUNDENPLANUNG}/${id}`, {
      method: 'POST',
      body: JSON.stringify(object)
    });
  }

  createTaetigkeitsbuchung(dto: ApiTaetigkeitsbuchung, produktPositionBuchungspunktId: string, personId?: string, vorgang?: string): Observable<ApiTaetigkeitsbuchung> {
    const params = new URLSearchParams();
    if (personId) params.append(QueryConst.PERSON_ID, personId);
    if (vorgang) params.append(QueryConst.VORGANG, vorgang);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PRODUKT_POSITIONEN_BUCHUNGSPUNKTE}/${produktPositionBuchungspunktId}/${PathConst.TAETIGKEITSBUCHUNGEN}?${queryString}`
      : `${PathConst.PRODUKT_POSITIONEN_BUCHUNGSPUNKTE}/${produktPositionBuchungspunktId}/${PathConst.TAETIGKEITSBUCHUNGEN}`;

    return this.request<ApiTaetigkeitsbuchung>(path, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  updateTaetigkeitsbuchung(dto: ApiTaetigkeitsbuchung, id: string, vorgang?: string): Observable<ApiTaetigkeitsbuchung> {
    const params = new URLSearchParams();
    if (vorgang) params.append(QueryConst.VORGANG, vorgang);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.TAETIGKEITSBUCHUNGEN}/${id}?${queryString}`
      : `${PathConst.TAETIGKEITSBUCHUNGEN}/${id}`;

    return this.request<ApiTaetigkeitsbuchung>(path, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  abschlussTag(datum: string, aufheben: boolean = false): Observable<void> {
    const params = new URLSearchParams();
    params.append(QueryConst.AUFHEBEN, aufheben.toString());

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.ABSCHLUSS_TAG}/${datum}?${queryString}`
      : `${PathConst.ABSCHLUSS_TAG}/${datum}`;

    return this.request<void>(path, {
      method: 'POST'
    });
  }

  abschlussMonat(datum: string): Observable<void> {
    return this.request<void>(`${PathConst.ABSCHLUSS_MONAT}/${datum}`, {
      method: 'POST'
    });
  }

  abschlussInfo(personIdStr: string): Observable<ApiAbschlussInfo> {
    return this.request<ApiAbschlussInfo>(`${PathConst.PERSONEN}/${personIdStr}/${PathConst.ABSCHLUSS_INFO}`);
  }

  createBereitschaft(dto: ApiStempelzeit, personIdStr: string): Observable<ApiStempelzeit[]> {
    return this.request<ApiStempelzeit[]>(`${PathConst.PERSONEN}/${personIdStr}/${PathConst.BEREITSCHAFT}`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  deleteBereitschaft(id: string): Observable<void> {
    return this.request<void>(`${PathConst.BEREITSCHAFT}/${id}`, {
      method: 'DELETE'
    });
  }

  feiertage(): Observable<ApiFeiertage> {
    return this.request<ApiFeiertage>(PathConst.FEIERTAGE);
  }

  createZivildienerUrlaubKrank(dto: ApiStempelzeit, personIdStr: string): Observable<ApiStempelzeit[]> {
    return this.request<ApiStempelzeit[]>(`${PathConst.PERSONEN}/${personIdStr}/${PathConst.ZIVI_URLAUBKRANK}`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  getInfo(): Observable<ApiInfo> {
    return this.request<ApiInfo>(PathConst.INFO);
  }

  getPersonPersonenverantwortlicher(personalverantwortlicherid: string, personenDetailStr?: string): Observable<ApiPerson[]> {
    const params = new URLSearchParams();
    if (personenDetailStr) params.append(QueryConst.PERSONDETAILGRAD, personenDetailStr);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${personalverantwortlicherid}/${PathConst.PERSONENVERANTWORTLICHE}?${queryString}`
      : `${PathConst.PERSONEN}/${personalverantwortlicherid}/${PathConst.PERSONENVERANTWORTLICHE}`;

    return this.request<ApiPerson[]>(path);
  }

  getPersonGeplantGebucht(personIdStr: string, positionIdStr?: string, planungsjahrStr?: string): Observable<ApiGeplantGebucht> {
    const params = new URLSearchParams();
    if (positionIdStr) params.append(QueryConst.PRODUKTPOSITION, positionIdStr);
    if (planungsjahrStr) params.append(QueryConst.PLANUNGSJAHR, planungsjahrStr);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${personIdStr}/${PathConst.GEPLANT_GEBUCHT}?${queryString}`
      : `${PathConst.PERSONEN}/${personIdStr}/${PathConst.GEPLANT_GEBUCHT}`;

    return this.request<ApiGeplantGebucht>(path);
  }

  getPersonGeplant(personIdStr: string, planungsjahrStr?: string, addGebucht?: boolean, nurAktiv?: boolean): Observable<ApiGeplantGebucht> {
    const params = new URLSearchParams();
    if (planungsjahrStr) params.append(QueryConst.PLANUNGSJAHR, planungsjahrStr);
    if (addGebucht !== undefined) params.append(QueryConst.ADD_GEBUCHT, addGebucht.toString());
    if (nurAktiv !== undefined) params.append(QueryConst.NUR_AKTIV, nurAktiv.toString());

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${personIdStr}/${PathConst.GEPLANT_GEBUCHT}?${queryString}`
      : `${PathConst.PERSONEN}/${personIdStr}/${PathConst.GEPLANT_GEBUCHT}`;

    return this.request<ApiGeplantGebucht>(path);
  }

  getAlleAktuellenTeamzuordnungen(): Observable<ApiTeamzuordnungen> {
    return this.request<ApiTeamzuordnungen>(PathConst.TEAMZUORDNUNGEN);
  }

  getAlleAktuellenVertragsparter(): Observable<ApiVertragspartnerListe> {
    return this.request<ApiVertragspartnerListe>(PathConst.VERTRAGSPARTNER);
  }

  getFreigabePositionen(funktion?: string): Observable<ApiFreigabePosition[]> {
    const params = new URLSearchParams();
    if (funktion) params.append(QueryConst.FUNKTION, funktion);

    const queryString = params.toString();
    const path = queryString ? `${PathConst.FREIGABE_POSITIONEN}?${queryString}` : PathConst.FREIGABE_POSITIONEN;

    return this.request<ApiFreigabePosition[]>(path);
  }

  getFreigabePositionenHistory(ab?: string, bis?: string): Observable<ApiFreigabePosition[]> {
    const params = new URLSearchParams();
    if (ab) params.append(QueryConst.AB, ab);
    if (bis) params.append(QueryConst.BIS, bis);

    const queryString = params.toString();
    const path = queryString ? `${PathConst.FREIGABE_POSITIONEN_HISTORY}?${queryString}` : PathConst.FREIGABE_POSITIONEN_HISTORY;

    return this.request<ApiFreigabePosition[]>(path);
  }

  getFreigabePositionTaetigkeitsbuchungen(id: string): Observable<ApiTaetigkeitsbuchung[]> {
    return this.request<ApiTaetigkeitsbuchung[]>(`${PathConst.FREIGABE_POSITIONEN}/${id}/${PathConst.TAETIGKEITSBUCHUNGEN}`);
  }

  updateFreigabePositionen(dto: ApiFreigabePosition[], buchungsIds?: string[]): Observable<ApiFreigabePosition[]> {
    const params = new URLSearchParams();
    if (buchungsIds) {
      buchungsIds.forEach(id => params.append(`${QueryConst.BUCHUNG_ID}`, id));
    }

    const queryString = params.toString();
    const path = queryString ? `${PathConst.FREIGABE_POSITIONEN}?${queryString}` : PathConst.FREIGABE_POSITIONEN;

    return this.request<ApiFreigabePosition[]>(path, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  getFreigabePositionenAnzahl(): Observable<ApiFreigabePositionAnzahl> {
    return this.request<ApiFreigabePositionAnzahl>(PathConst.FREIGABE_POSITIONEN_ANZAHL);
  }

  getFreigabeGruppen(): Observable<ApiProduktPosition[]> {
    return this.request<ApiProduktPosition[]>(PathConst.FREIGABE_GRUPPEN);
  }

  getPersonVermerke(personIdStr: string, ab?: string, bis?: string): Observable<ApiPersonenvermerk[]> {
    const params = new URLSearchParams();
    if (ab) params.append(QueryConst.AB, ab);
    if (bis) params.append(QueryConst.BIS, bis);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${personIdStr}/${PathConst.PERSONENVERMERKE}?${queryString}`
      : `${PathConst.PERSONEN}/${personIdStr}/${PathConst.PERSONENVERMERKE}`;

    return this.request<ApiPersonenvermerk[]>(path);
  }

  createPersonVermerk(dto: ApiPersonenvermerk, personIdStr: string): Observable<ApiPersonenvermerk> {
    return this.request<ApiPersonenvermerk>(`${PathConst.PERSONEN}/${personIdStr}/${PathConst.PERSONENVERMERKE}`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  updatePersonVermerk(dto: ApiPersonenvermerk, id: string): Observable<ApiPersonenvermerk> {
    return this.request<ApiPersonenvermerk>(`${PathConst.PERSONENVERMERKE}/${id}`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  deletePersonVermerk(id: string): Observable<void> {
    return this.request<void>(`${PathConst.PERSONENVERMERKE}/${id}`, {
      method: 'DELETE'
    });
  }

  getPersonDurchfuehrungsverantwortlicher(jahrStr?: string): Observable<ApiPerson[]> {
    const params = new URLSearchParams();
    if (jahrStr) params.append(QueryConst.JAHR, jahrStr);

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN_DURCHFUEHRUNGSVERANTWORTLICHER}?${queryString}`
      : PathConst.PERSONEN_DURCHFUEHRUNGSVERANTWORTLICHER;

    return this.request<ApiPerson[]>(path);
  }

  getVertraegeVerantwortlicher(): Observable<ApiVertrag[]> {
    return this.request<ApiVertrag[]>(PathConst.VERTRAEGE_VERTRAGSVERANTWORTLICHER);
  }

  mussInfoPdfLesen(): Observable<ApiMussPdfLesen> {
    return this.request<ApiMussPdfLesen>(PathConst.INFOPDF_MUSSLESEN);
  }

  hatInfoPdfGelesen(): Observable<void> {
    return this.request<void>(PathConst.INFOPDF_HATGELESEN, {
      method: 'POST'
    });
  }

  sendStempelzeitCalendar(id: string): Observable<void> {
    return this.request<void>(`${PathConst.STEMPELZEITEN}/sendCalendar/${id}`, {
      method: 'POST'
    });
  }

  getAlleAktuellenGeschaeftszahlen(): Observable<ApiGeschaeftszahlenListe> {
    return this.request<ApiGeschaeftszahlenListe>(PathConst.GESCHAEFZSZAHLEN);
  }

  getAlleAktuellenRollenbezeichnungen(): Observable<ApiRollenbezeichnungsListe> {
    return this.request<ApiRollenbezeichnungsListe>(PathConst.ROLLENBEZEICHNUNGEN);
  }

  getAlleAktuellenLeistungskategorien(): Observable<ApiLeistungskategorien> {
    return this.request<ApiLeistungskategorien>(PathConst.LEISTUNGSKATEGORIEN);
  }
}
