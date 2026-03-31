import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';

import { ApiAuswertungsart, getApiAuswertungsartDisplayValues } from '../../models/Auswertungsart.enum';
import { ApiProdukt } from '../../models-2/ApiProdukt';
import { ApiProduktPosition } from '../../models-2/ApiProduktPosition';
import { ApiPerson } from '../../models-2/ApiPerson';
import { AuswertungService } from '../../services/auswertung2.service';

// interface SelectOption<T> {
//   label: string;
//   value: T;
// }

@Component({
  selector: 'app-auswertung2',
  templateUrl: './auswertung2.component.html',
  styleUrls: ['./auswertung2.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    MatSelectModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
})
export class Auswertung2Component implements OnInit {

  auswertungsartOptions: { key: ApiAuswertungsart; value: string }[] =
    getApiAuswertungsartDisplayValues();

selectedAuswertungsart: ApiAuswertungsart | string | null = null;

  jahrOptions: { label: string; value: number }[] = [];
  selectedJahr: number = new Date().getFullYear();

  monatOptions:{ label: string; value: number | string | null }[] = [];
  selectedMonat: number | string | null = 'ALL';

  produkte: ApiProdukt[] = [];
  selectedProdukt: ApiProdukt | null = null;
///////////////////htis is a commet to deploy///////
  produktPositionen: ApiProduktPosition[] = [];
  selectedProduktPositionen: ApiProduktPosition[] = [];

  mitarbeiter: ApiPerson[] = [];
  selectedMitarbeiter: ApiPerson[] = [];

  isLoading = false;
  showMitarbeiter = false;

  erstellenError: string | null = null;

  constructor(private auswertungService: AuswertungService) {}

  ngOnInit(): void {
  this.buildJahrOptions();
  this.buildMonatOptions();

  // Auto-select first Auswertungsart
  if (this.auswertungsartOptions.length > 0) {
    this.selectedAuswertungsart = this.auswertungsartOptions[0].key;
    this.onAuswertungsartChange();
  }
}

  private buildJahrOptions(): void {
    const startYear = 2006;
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= startYear; year--) {
      this.jahrOptions.push({ label: year.toString(), value: year });
    }
  }

  private buildMonatOptions(): void {
    this.monatOptions.push({ label: 'Alle', value: 'ALL' as unknown as null });
    const formatter = new Intl.DateTimeFormat('de-AT', { month: 'long' });
    for (let month = 0; month < 12; month++) {
      const date = new Date(2024, month, 1);
      this.monatOptions.push({ label: formatter.format(date), value: month + 1 });
    }
  }

  onAuswertungsartChange(): void {
    this.produkte = [];
    this.selectedProdukt = null;
    this.produktPositionen = [];
    this.selectedProduktPositionen = [];
    this.mitarbeiter = [];
    this.selectedMitarbeiter = [];
    this.erstellenError = null;

    if (this.selectedAuswertungsart === null || this.selectedAuswertungsart === 'NONE') return;

    this.showMitarbeiter = this.selectedAuswertungsart !== ApiAuswertungsart.EIGENE && this.selectedAuswertungsart !== 'NONE';
    this.isLoading = true;

    if (this.selectedAuswertungsart === ApiAuswertungsart.EIGENE) {
      this.auswertungService.getPersonProdukte('me','buchbar').subscribe({
next: (data) => {
  this.produkte = data;
  if (data.length > 0) this.onProduktSelect(data[0]);
  this.isLoading = false;
},
        error: (err) => { console.error('getEigeneProdukte error:', err); this.isLoading = false; },
      });
    } else {
      this.auswertungService.getProdukte1('false','verantwortlichAuswertung').subscribe({
next: (data) => {
  this.produkte = data;
  if (data.length > 0) this.onProduktSelect(data[0]);
  this.isLoading = false;
},
        error: (err) => { console.error('getAlleProdukte error:', err); this.isLoading = false; },
      });
      this.auswertungService.getPersonen1().subscribe({
        next: (data) => (this.mitarbeiter = data),
        error: (err) => console.error('getMitarbeiter error:', err),
      });
    }
  }

//  onProduktSelect(produkt: ApiProdukt): void {
//   this.selectedProdukt = produkt;
//   this.selectedProduktPositionen = [];
//   if (!produkt.id) return;
//   this.isLoading = true;

//   this.auswertungService.getProdukt(produkt.id, 'verantwortlichAuswertung').subscribe({
//     next: (detail) => {
//       this.produktPositionen = (detail.produktPosition ?? [])
//         // .filter(pos => pos.aktiv === true);
//       this.isLoading = false;
//         console.log('here is the details',detail);
//     },
//     error: (err) => {
//       console.error('getProdukt error:', err);
//       this.isLoading = false;
//     }
//   });
// }
onProduktSelect(produkt: ApiProdukt): void {

  this.selectedProdukt = produkt;
  this.selectedProduktPositionen = [];

  this.produktPositionen = produkt.produktPosition ?? [];

}

async onErstellen(): Promise<void> {

if (!this.selectedProdukt) return;


  if (this.selectedProduktPositionen.length === 0) {
    this.erstellenError = 'Bitte eine Produktposition auswählen.';
    return;
  }

  const isSollIst = [
    ApiAuswertungsart.EV_SOLL_IST, ApiAuswertungsart.EV_SOLL_IST_VORJAHR,
    ApiAuswertungsart.DV_SOLL_IST, ApiAuswertungsart.DV_SOLL_IST_VORJAHR,
    ApiAuswertungsart.PV_SOLL_IST, ApiAuswertungsart.PV_SOLL_IST_VORJAHR,
    ApiAuswertungsart.TL_SOLL_IST, ApiAuswertungsart.TL_SOLL_IST_VORJAHR,
  ].includes(this.selectedAuswertungsart as ApiAuswertungsart);

  if (this.showMitarbeiter && this.selectedMitarbeiter.length === 0) {
    this.erstellenError = 'Bitte einen Mitarbeiter auswählen.';
    return;
  }

  this.erstellenError = null;
const produktIds = [this.selectedProdukt.id];

const produktPositionIds =
this.selectedProduktPositionen.map(p => p.id);

const personenIds =
this.selectedMitarbeiter.map(p => p.id);

const art = this.selectedAuswertungsart;
console.log("jahr", this.selectedJahr);
console.log("monat", this.selectedMonat);
console.log("art", art);
console.log("produktIds", produktIds);
console.log("produktPositionIds", produktPositionIds);
console.log("personenIds", personenIds);
this.isLoading = true;


if (
  art === ApiAuswertungsart.EV_SOLL_IST ||
  art === ApiAuswertungsart.EV_SOLL_IST_VORJAHR
) {

const personId = personenIds[0];

if (!personId) {
  this.isLoading = false;
  return;
}

this.auswertungService
  .getPersonAuswertung(personId, this.selectedJahr.toString())
   .subscribe({
    next: async (blob: Blob) => {
      await this.downloadBlob(blob, 'Auswertung.xlsx');
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Download error:', err);
      this.erstellenError = 'Fehler beim Erstellen der Auswertung.';
      this.isLoading = false;
    }
  });
}
else {

const monat =
  this.selectedMonat !== 'ALL'
    ? this.selectedMonat?.toString()
    : undefined;

this.auswertungService.auswertung(
  this.selectedJahr.toString(),
  monat,
  art ?? undefined,
  produktIds.join(','),
  produktPositionIds.join(','),
  personenIds.join(',')
)
      .subscribe({
    next: (blob: Blob) => {
      this.downloadBlob(blob, 'Auswertung.xlsx');
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Download error:', err);
      this.erstellenError = 'Fehler beim Erstellen der Auswertung.';
      this.isLoading = false;
    }
  });


}
}
private async downloadBlob(blob: Blob, filename: string): Promise<void> {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

  // readonly AuswertungsartEnum = ApiAuswertungsart;
}
