import { Inject, Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { ApiPerson } from '../models-2/ApiPerson';
import { ApiProdukt } from '../models-2/ApiProdukt';
import { ApiStempelzeit } from '../models-2/ApiStempelzeit';
import { ApiAbschlussInfo } from '../models-2/ApiAbschlussInfo';

const PathConst = {
  PERSONEN: 'personen',
  PRODUKTE: 'produkte',
  STEMPELZEITEN: 'stempelzeiten',
  ABSCHLUSS_INFO: 'abschluss/info'
} as const;

const QueryConst = {
  PERSONDETAILGRAD: 'persondetail',
  BERECHNETE_STUNDEN: 'berechneteStunden',
  ADD_VERTRAEGE: 'addVertraege',
  FILTER: 'filter',
  TAETIGKEITEN_AB: 'taetigkeitenAb',
  TAETIGKEITEN_BIS: 'taetigkeitenBis',
  PLANUNGSJAHR: 'planungsjahr',
  LOGIN_AB: 'loginAb',
  LOGIN_BIS: 'loginBis'
} as const;

@Injectable({
  providedIn: 'root'
})
export class TatigkeitenHistorischTwoService {
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

  getPerson(
    id: string,
    persondetail?: string,
    berechneteStunden: boolean = true,
    addVertraege: boolean = false
  ): Observable<ApiPerson> {
    const params = new URLSearchParams();
    if (persondetail) params.append(QueryConst.PERSONDETAILGRAD, persondetail);
    params.append(QueryConst.BERECHNETE_STUNDEN, berechneteStunden.toString());
    params.append(QueryConst.ADD_VERTRAEGE, addVertraege.toString());

    const queryString = params.toString();
    const path = queryString
      ? `${PathConst.PERSONEN}/${id}?${queryString}`
      : `${PathConst.PERSONEN}/${id}`;

    return this.request<ApiPerson>(path);
  }

  getPersonProdukte(
    personId: string,
    filter: string = 'gebucht',
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

  abschlussInfo(personIdStr: string): Observable<ApiAbschlussInfo> {
    return this.request<ApiAbschlussInfo>(
      `${PathConst.PERSONEN}/${personIdStr}/${PathConst.ABSCHLUSS_INFO}`
    );
  }
}
