import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiProdukt } from '../models-2/ApiProdukt';
import { ApiPerson } from '../models-2/ApiPerson';
import { ApiAuswertungsart } from '../models-2/ApiAuswertungsart';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuswertungService {
  private readonly base = '/getitgui/proxy/v1';

  // ── IMPORTANT: these files must be in your /public folder ────────────────
  // For "Eigene": uses the same file as "Alle" for now (you have one JSON)
  // ⚠️ If your file is named differently, update these paths!
  private readonly jsonEigeneProdukte = '/json_products_list_box.json';
  private readonly jsonAlleProdukte   = '/json_products_list_box-Alle.json'; // ← using SAME file
  private readonly jsonMitarbeiter    = '/json_mitarbeiter_lists.json';
private readonly jsonProduktDetail = '/awsert-json_produkt_detaills.json'; // ← add this

  constructor(private http: HttpClient) {}

  // getEigeneProdukte(): Observable<ApiProdukt[]> {
  //   return this.http.get<ApiProdukt[]>(this.jsonEigeneProdukte).pipe(
  //     tap(data => console.log(' getEigeneProdukte:', data.length))
  //   );
  // }

  // getAlleProdukte(): Observable<ApiProdukt[]> {
  //   return this.http.get<ApiProdukt[]>(this.jsonAlleProdukte).pipe(
  //     tap(data => console.log(' getAlleProdukte:', data.length))
  //   );
  // }

  // getMitarbeiter(): Observable<ApiPerson[]> {
  //   return this.http.get<ApiPerson[]>(this.jsonMitarbeiter).pipe(
  //     tap(data => console.log(' getMitarbeiter:', data.length))
  //   );
  // }

  // createAuswertung(
  //   art: string,
  //   jahr: number,
  //   monat: number | null,
  //   produktIds: string[],
  //   produktPositionIds: string[],
  //   mitarbeiterIds?: string[]
  // ): Observable<Blob> {
  //   let params = new HttpParams()
  //     .set('art', art)
  //     .set('jahr', jahr.toString());

  //   if (monat !== null) {
  //     params = params.set('monat', monat.toString());
  //   }

  //   produktIds.forEach(id => (params = params.append('produkte', id)));
  //   produktPositionIds.forEach(id => (params = params.append('produktPositionen', id)));

  //   if (mitarbeiterIds && mitarbeiterIds.length > 0) {
  //     mitarbeiterIds.forEach(id => (params = params.append('mitarbeiter', id)));
  //   }

  //   return this.http.get(`${this.base}/auswertungen`, {
  //     params,
  //     responseType: 'blob',
  //   });
  // }

auswertung(
  jahrStr?: string,
  monatStr?: string,
  art?: ApiAuswertungsart | string,
  produktIdsStr?: string,
  produktPositionIdsStr?: string,
  personenStr?: string,
  useVerrechnetDate: string = 'true'
): Observable<Blob> {
  // ── MOCK: return a minimal valid xlsx blob ──────────────────────────
  const fakeBlob = this.createFakeExcelBlob();
  return of(fakeBlob);
}
getPersonAuswertung(personId: string, jahr: string, dvString?: string): Observable<Blob> {
  // ── MOCK: return a minimal valid xlsx blob ──────────────────────────
  const fakeBlob = this.createFakeExcelBlob();
  return of(fakeBlob);
}
private createFakeExcelBlob(): Blob {
  // A minimal valid .xlsx is a ZIP file — this is the smallest possible one
  // that Excel will actually open without errors
  const base64Xlsx =
    'UEsDBBQAAAAIAAAAIQBi7p1oXgEAAJAEAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbO2Uy2rDMBCF9' +
    '4W+g9G+tizHdSmx86AsSlr6AEIaJ6KWJCT59Z2kpC5p6aKlXQiMNOfMmYtG8+VBN8UenFemJTQr' +
    'KCmwlakqsyX0vX6aLqhwXphKNMZCSwcoy8X9Xb83YF2WdpQ2BNsyxpUWtPCZsWByUhunBYbUbZkV' +
    'ciO2wOZ5PmPWGAe1TwPQxZIKWu0hvdQZWAcpjInvVHRopKXAqx1bpDxr1GOeW9pLR5OWfSAWXHoZ' +
    'GtKmoDmA+CygrTWCyq2lgaE7dKFVQG9pLlLQ5Qh0AAAAAA==';

  const binary = atob(base64Xlsx);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });}
//////1///////
	getPersonProdukte(
		  parentId: string,
		  filter: string,
		  taetigkeitenAb?: string,
		  taetigkeitenBis?: string,
		  planungsjahr?: string
		): Observable<ApiProdukt[]> {
      return this.http.get<ApiProdukt[]>(this.jsonEigeneProdukte).pipe(
      tap(data => console.log('getEigeneProdukte:', data.length))
    );
    }
//2/////
    	getProdukte1(
  expandAllStr: string = 'false',
  filter?: string
): Observable<ApiProdukt[]> {
      return this.http.get<ApiProdukt[]>(this.jsonAlleProdukte).pipe(
      tap(data => console.log('✅ getAlleProdukte:', data.length))
    );
    }
    	getPersonen1(
  berechneteStunden?: boolean,
  nurNamen?: boolean
): Observable<ApiPerson[]>{
 return this.http.get<ApiPerson[]>(this.jsonMitarbeiter).pipe(
      tap(data => console.log('✅ getMitarbeiter:', data.length))
    );}

getProdukt(id: string, filter?: string): Observable<ApiProdukt> {
  return this.http.get<ApiProdukt>(this.jsonProduktDetail).pipe(
    tap(data => console.log('✅ getProdukt:', data))
  );
}

}
