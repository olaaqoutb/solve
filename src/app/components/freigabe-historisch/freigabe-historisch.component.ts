import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from "@angular/material/menu";
import { ActivatedRoute } from '@angular/router';
import { FreigabeHistorischService } from '../../services/freigabe-historisch.service';
interface TimeEntry {
  Produktposition: string;
  Monat: string;
  Mitarbeiter: string;
  Std: string;
  anmerkung?: string;
  id?: string;
  minutenDauer?: number;
  freigabeStatus?: string;
  produktPositionDisplay?: string;
  produktPosition?: any;
  bucher?: any;
  buchungsZeitraum?: string;
  metadaten?: any;
}

interface TimeEntryDetail {
  Datum: string;
  Buchungspunkt: string;
  Tatigkeit: string;
  Stunden: string;
  id?: string;
}

interface BookingData {
  id: string;
  version: number;
  deleted: boolean;
  anmerkung?: string;
  freigabeStatus: string;
  minutenDauer: number;
  buchungsZeitraum: string;
  produktPosition: {
    produktPositionname: string;
    produkt?: {
      kurzName: string;
    };
  };
  bucher: {
    vorname: string;
    nachname: string;
  };
  metadaten?: {
    originalProduktPosition: string;
  };
}

interface LogbuchEntry {
  "Bearbeitungszeit": string;
  "Bearbeiter": string;
  "Bearbeiter Id": string;
  "Vorgang": string;
  "Anmerkung": string;
  "Minutendauer": string;
  "Freigabestatus": string;
  "Buchungszeitraum": string;
  "Bucher": string;
  "ProduktPosition": string;
  "OriginalProduktPosition": string;
  "Metadaten": string;
  index?: number;
}

@Component({
  selector: 'app-freigabe-historisch',
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    HttpClientModule,
    MatRadioModule,
    MatButtonModule,
    MatInputModule,
    MatMenuModule
  ],
  templateUrl: './freigabe-historisch.component.html',
  styleUrl: './freigabe-historisch.component.scss'
})
export class FreigabeHistorischComponent implements OnInit {
  dropdownOptions: string[] = [];
  selectedOption: string = this.dropdownOptions[0];
  availableMonths: Set<string> = new Set();
  selectedEntry: TimeEntry | null = null;
  displayedColumns: string[] = ['Produktposition', 'Monat', 'Mitarbeiter', 'Std', 'actions'];
  dataSource: TimeEntry[] = [];
  detailedData: TimeEntryDetail[] = [];
  detailDisplayedColumns: string[] = ['Datum', 'Buchungspunkt', 'Tatigkeit', 'Stunden'];
  selectedEntryId: string | null = null;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  jsonData: BookingData[] = [];
  originalDataSource: TimeEntry[] = [];
  freigabeId!: string;
  sortState: { [key: string]: 'asc' | 'desc' } = {
    Produktposition: 'asc',
    Monat: 'asc',
    Mitarbeiter: 'asc',
    Std: 'asc',
  };
   // Add detail table sorting state
  detailSortState: { [key: string]: 'asc' | 'desc' } = {
    Datum: 'asc',
    Buchungspunkt: 'asc',
    Tatigkeit: 'asc',
    Stunden: 'asc',
  };

  logbuchEntries: LogbuchEntry[] = [];
  currentLogbuchEntryIndex: number = 0;
  selectedLogbuchEntry: LogbuchEntry | null = null;
  showLogbuch: boolean = false;


  constructor(private http: HttpClient, private freigabeHistorischService: FreigabeHistorischService, private route: ActivatedRoute) {}
  // Add these methods for detail table sorting
  toggleDetailSort(field: string) {
    this.detailSortState[field] = this.detailSortState[field] === 'asc' ? 'desc' : 'asc';
    this.applyDetailSorting(field);
  }

  applyDetailSorting(field: string) {
    const direction = this.detailSortState[field];
    this.detailedData = [...this.detailedData].sort((a, b) => {
      let valueA = this.getDetailSortValue(a, field);
      let valueB = this.getDetailSortValue(b, field);

      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private getDetailSortValue(item: TimeEntryDetail, field: string): any {
    switch (field) {
      case 'Datum':
        // Convert German date format to sortable format
        const [day, month, year] = (item.Datum || '00.00.0000').split('.');
        return new Date(`${year}-${month}-${day}`);
      case 'Buchungspunkt':
        return (item.Buchungspunkt || '').toString().toLowerCase();
      case 'Tatigkeit':
        return (item.Tatigkeit || '').toString().toLowerCase();
      case 'Stunden':
        const [hours, minutes] = (item.Stunden || '0:00').split(':').map(Number);
        return hours * 60 + minutes;
      default:
        return (item[field as keyof TimeEntryDetail] || '').toString().toLowerCase();
    }
  }

  getDetailSortIcon(column: string): string {
    if (this.detailSortState[column] === 'asc') {
      return 'keyboard_arrow_up';
    } else if (this.detailSortState[column] === 'desc') {
      return 'keyboard_arrow_down';
    }
    return 'swap_vert';
  }

  // ADD this function to format the Produktposition display
 formatProduktPosition(item: any): string {
  const produktPositionName = item.produktPosition?.produktPositionname || '';
  const kurzName = item.produktPosition?.produkt?.kurzName || '';

  // نجمع القيم اللي ليها محتوى فقط
  const parts = [produktPositionName, kurzName].filter(v => v && v.trim() !== '');

  // لو في قيم ندمجهم بـ » ، لو مفيش نرجع No
  return parts.length ? parts.join(' » ') : 'No';
}



  getOriginalPosition(element: TimeEntry): string {
    const original = element.metadaten?.originalProduktPosition;
    return original && original.trim() !== '' ? original : 'none';
  }

  getCurrentPosition(element: TimeEntry): string {
    const currentPosition = element.produktPosition?.produktPositionname || 'N/A';
    const productShortName = element.produktPosition?.produkt?.kurzName || '';

    if (productShortName && productShortName.trim() !== '') {
      return `${currentPosition} (${productShortName})`;
    }

    return currentPosition;
  }

  getPlainCurrentPosition(element: TimeEntry): string {
    return element.produktPosition?.produktPositionname || 'N/A';
  }

  shouldShowOriginalPosition(element: TimeEntry): boolean {
    const original = this.getOriginalPosition(element);
    const current = this.getPlainCurrentPosition(element);
    return !!original && original !== current && original !== 'N/A' && original !== 'none';
  }

  hasRealOriginalPosition(element: TimeEntry): boolean {
    const original = element.metadaten?.originalProduktPosition;
    return !!(original && original.trim() !== '');
  }

  getProductShortName(element: TimeEntry): string {
    return element.produktPosition?.produkt?.kurzName || '';
  }

  loadLogbuchDataFromCsv() {
    const csvString = `
"Bearbeitungszeit";"Bearbeiter";"Bearbeiter Id";"Vorgang";"Anmerkung";"Minutendauer";"Freigabestatus";"Buchungszeitraum";"Bucher";"ProduktPosition";"OriginalProduktPosition";"Metadaten"
"2024-10-08 13:32:03";"Monatsabschluss";"Monatsabschluss";"Monatsabschluss";;"259";"PRUEFEN_DV";"2024-08-01";"Ing. Peter Franz Thiem";"CCQA | Testmanagement";"BO | Betrieb";"OriginalProdukt: BO, OriginalProduktposition: Betrieb"
"2024-10-08 13:35:28";"Thiem Peter Franz";"thiem01@bmi.gv.at";"FreigabePositionStatusAendern";"OK";"259";"PRUEFEN_EV";"2024-08-01";"Ing. Peter Franz Thiem";"CCQA | Testmanagement";"BO | Betrieb";"OriginalProdukt: BO, OriginalProduktposition: Betrieb"
"2024-10-08 13:36:07";"Thiem Peter Franz";"thiem01@bmi.gv.at";"FreigabePositionStatusAendern";"OK";"259";"FREIGEGEBEN";"2024-08-01";"Ing. Peter Franz Thiem";"CCQA | Testmanagement";"BO | Betrieb";"OriginalProdukt: BO, OriginalProduktposition: Betrieb, In Vertretung: AL i.A. Walter Hofstetter"
`;

    try {
      const lines = csvString.trim().split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        console.error('CSV is empty or malformed.');
        return;
      }

      const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
      this.logbuchEntries = lines.slice(1).map((line, index) => {
        const values = line.split(';').map(v => v.replace(/"/g, '').trim());
        const entry: LogbuchEntry = {} as LogbuchEntry;

        headers.forEach((header, i) => {
          if (i < values.length) {
            (entry as any)[header] = values[i];
          }
        });

        entry.index = index;
        return entry;
      });

      this.logbuchEntries.sort((a, b) =>
        new Date(b['Bearbeitungszeit']).getTime() - new Date(a['Bearbeitungszeit']).getTime()
      );

      if (this.logbuchEntries.length > 0) {
        this.currentLogbuchEntryIndex = 0;
        this.selectedLogbuchEntry = this.logbuchEntries[0];
      }
    } catch (error) {
      console.error('Error loading logbook data:', error);
    }
  }

  ngOnInit() {
     this.freigabeId = this.route.snapshot.paramMap.get('id')!;
    this.generateDropdownOptions();
    this.loadData();
    this.loadJsonData();
    this.loadLogbuchDataFromCsv();
  }

 generateDropdownOptions() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear(); // Current year

  this.dropdownOptions = [];

  for (let i = 0; i < 12; i++) {
    let month = currentMonth - i;
    let year = currentYear;

    // Handle month underflow (previous year)
    if (month < 1) {
      month += 12;
      year -= 1;
    }

    const formattedMonth = month.toString().padStart(2, '0');
    this.dropdownOptions.push(`${formattedMonth}-${year}`);
  }

  this.selectedOption = this.dropdownOptions[0];
}
  openLogbuch() {
    this.showLogbuch = true;
    if (this.logbuchEntries.length > 0) {
      this.selectedLogbuchEntry = this.logbuchEntries[this.currentLogbuchEntryIndex];
    }
  }

  closeLogbuch() {
    this.showLogbuch = false;
  }

  navigateLogbuch(direction: 'prev' | 'next') {
    if (!this.selectedLogbuchEntry) return;

    if (direction === 'prev') {
      this.currentLogbuchEntryIndex = Math.max(0, this.currentLogbuchEntryIndex - 1);
    } else {
      this.currentLogbuchEntryIndex = Math.min(this.logbuchEntries.length - 1, this.currentLogbuchEntryIndex + 1);
    }
    this.selectedLogbuchEntry = this.logbuchEntries[this.currentLogbuchEntryIndex];
  }

  parseMetadaten(metadatenString: string): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    if (!metadatenString) return result;

    try {
      const parts = metadatenString.split(', ');
      parts.forEach(part => {
        const [key, ...valueParts] = part.split(': ');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(': ').trim();
          result[key.trim()] = value;
        }
      });
    } catch (error) {
      console.warn('Error parsing metadata:', error);
    }

    return result;
  }

  shouldShowSimpleFormat(): boolean {
    if (!this.selectedLogbuchEntry) return true;
    const simpleFormatVorgange = ['Monatsabschluss', 'BuchungErfassen', 'BuchungAendern'];
    return simpleFormatVorgange.includes(this.selectedLogbuchEntry['Vorgang']);
  }

  getPreviousStatus(): string {
    if (!this.selectedLogbuchEntry || this.currentLogbuchEntryIndex === 0) {
      return 'KEIN_VORGÄNGER';
    }

    const previousEntry = this.logbuchEntries[this.currentLogbuchEntryIndex - 1];
    return previousEntry ? previousEntry['Freigabestatus'] : 'UNBEKANNT';
  }

  getFormattedMetadaten(): string {
    if (!this.selectedLogbuchEntry || !this.selectedLogbuchEntry['Metadaten']) {
      return '';
    }
    const parsedMeta = this.parseMetadaten(this.selectedLogbuchEntry['Metadaten']);
    const metaValues = [];
    if (parsedMeta['OriginalProdukt']) metaValues.push(parsedMeta['OriginalProdukt']);
    if (parsedMeta['OriginalProduktposition']) metaValues.push(parsedMeta['OriginalProduktposition']);
    if (parsedMeta['In Vertretung']) metaValues.push(parsedMeta['In Vertretung']);
    return metaValues.join(', ');
  }

  loadJsonData() {
    this.freigabeHistorischService.getFreigabe().subscribe({
      next: (data) => {
        this.jsonData = data;
        this.loadData();
      },
      error: (error) => {
        console.error('Error loading JSON data:', error);
      },
    });
  }

  loadData() {
  this.freigabeHistorischService.getFreigabeById(this.freigabeId).subscribe({
    next: (data) => {
      const mappedData = data.map((item: any) => {
        // تحديد مصدر القيم سواء من metadaten أو produktPosition
        const produktPositionName =
          item.metadaten?.originalProduktPosition ||
          item.produktPosition?.produktPositionname ||
          'No';

        const kurzName =
          item.metadaten?.originalProdukt ||
          item.produktPosition?.produkt?.kurzName ||
          'No';

        return {
          Produktposition: `${produktPositionName} » ${kurzName}`,
          Monat: this.formatMonth(item.buchungsZeitraum),
          Mitarbeiter: item.bucher
            ? `${item.bucher.vorname} ${item.bucher.nachname}`
            : 'Unbekannt',
          Std: this.formatMinutesToHoursMinutes(item.minutenDauer),
          anmerkung: item.anmerkung,
          id: item.id,
          minutenDauer: item.minutenDauer,
          freigabeStatus: item.freigabeStatus,
          buchungsZeitraum: item.buchungsZeitraum,
          metadaten: item.metadaten,
          produktPosition: item.produktPosition,
          produktPositionDisplay: `${produktPositionName} » ${kurzName}`,
        };
      });

      // حفظ البيانات في الـ dataSource
      this.dataSource = mappedData;
      this.originalDataSource = mappedData;

      // استخراج الشهور
      this.extractAvailableMonths(data);

      // ترتيب حسب العمود
      this.applySorting('Produktposition');
    },
    error: (error) => {
      console.error('Error loading data:', error);
    },
  });
}

private extractAvailableMonths(data: any[]) {
  this.availableMonths.clear();
  data.forEach((item) => {
    if (item.buchungsZeitraum) {
      const month = this.formatMonth(item.buchungsZeitraum);
      if (month !== 'Unbekannt') {
        this.availableMonths.add(month);
      }
    }
  });
}

  onDropdownChange() {
    if (this.selectedOption && this.availableMonths.has(this.selectedOption)) {
      this.applyFilter(this.selectedOption);
      const currentSortField = Object.keys(this.sortState).find(key =>
        this.sortState[key] !== 'asc' && this.sortState[key] !== 'desc'
      );
      if (currentSortField) {
        this.applySorting(currentSortField);
      }
    } else {
      this.dataSource = [...this.originalDataSource];
      const currentSortField = Object.keys(this.sortState).find(key =>
        this.sortState[key] !== 'asc' && this.sortState[key] !== 'desc'
      );
      if (currentSortField) {
        this.applySorting(currentSortField);
      }
    }
  }

  private applyFilter(selectedMonth: string) {
    const filteredData = this.originalDataSource.filter(entry =>
      entry.Monat === selectedMonth
    );

    const currentSortField = Object.keys(this.sortState).find(field =>
      this.sortState[field] === 'asc' || this.sortState[field] === 'desc'
    );

    if (currentSortField) {
      const direction = this.sortState[currentSortField];
      this.dataSource = filteredData.sort((a, b) => {
        let valueA = this.getSortValue(a, currentSortField);
        let valueB = this.getSortValue(b, currentSortField);

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      this.dataSource = filteredData;
    }
  }


  loadDetailedData(entryId: string) {
    this.isLoading = true;
    this.http.get<any[]>('response_Freigabe_Historisch_detail_1.json').subscribe({
      next: (data) => {
        this.isLoading = false;
        this.detailedData = data.map((item) => ({
          Datum: item.datum ? this.formatDate(item.datum) : '',
          Buchungspunkt: item.buchungspunkt?.buchungspunkt || 'Wartung',
          Tatigkeit: item.taetigkeit || '',
          Stunden: this.formatMinutesToHoursMinutes(item.minutenDauer),
          id: item.id,
        }));

        // Apply default sorting to detail data
        this.applyDetailSorting('Datum');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading detailed data:', error);
        this.detailedData = [];
      },
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  }

  toggleSort(field: string) {
    this.sortState[field] = this.sortState[field] === 'asc' ? 'desc' : 'asc';
    this.applySorting(field);
  }

  applySorting(field: string) {
    const direction = this.sortState[field];
    this.dataSource = [...this.dataSource].sort((a, b) => {
      let valueA = this.getSortValue(a, field);
      let valueB = this.getSortValue(b, field);

      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private getSortValue(item: TimeEntry, field: string): any {
    switch (field) {
      case 'Produktposition':
        return (item.Produktposition || '').toString().toLowerCase();
      case 'Monat':
        const [month, year] = (item.Monat || '00-0000').split('-');
        return parseInt(year + month, 10);
      case 'Mitarbeiter':
        return (item.Mitarbeiter || '').toString().toLowerCase();
      case 'Std':
        const [hours, minutes] = (item.Std || '0:00').split(':').map(Number);
        return hours * 60 + minutes;
      default:
        return (item[field as keyof TimeEntry] || '').toString().toLowerCase();
    }
  }

  getSortIcon(column: string): string {
    if (this.sortState[column] === 'asc') {
      return 'keyboard_arrow_up';
    } else if (this.sortState[column] === 'desc') {
      return 'keyboard_arrow_down';
    }
    return 'swap_vert';
  }

  formatMonth(dateString: string): string {
    if (!dateString) return 'Unbekannt';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string provided:', dateString);
      return 'Unbekannt';
    }
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}`;
  }

  formatMinutesToHoursMinutes(totalMinutes: number | undefined): string {
    if (totalMinutes === undefined || isNaN(totalMinutes)) {
      return '0:00';
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${hours}:${formattedMinutes}`;
  }

  selectEntry(entry: TimeEntry) {
    this.selectedEntry = { ...entry };
    this.selectedEntryId = entry.id || null;
    this.isEditMode = false;

    const jsonEntry = this.jsonData.find(item => item.id === entry.id);
    if (jsonEntry) {
      console.log('JSON data for selected entry:', jsonEntry);
    }

    if (entry.id) {
      this.loadDetailedData(entry.id);
    } else {
      this.detailedData = [];
    }
  }

  getRowStyle(entry: TimeEntry): { color: string } {
    switch (entry.freigabeStatus) {
      case 'ABGELEHNT':
        return { color: '#c00' };
      case 'PRUEFEN_EV':
        return { color: '#000000' };
      case 'FREIGEGEBEN':
        return { color: '#008000' };
      case 'PRUEFEN_DV':
        return { color: '#007bff' };
      default:
        return { color: 'inherit' };
    }
  }

  getOddEvenRowClass(index: number): string {
    return index % 2 === 0 ? 'even-row-bg' : 'odd-row-bg';
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveChanges() {
    if (this.selectedEntry) {
      console.log('Saving changes:', this.selectedEntry);
      this.isEditMode = false;
    }
  }

  downloadCsv() {
    if (!this.selectedLogbuchEntry) return;

    const headers = [
      'Bearbeitungszeit', 'Bearbeiter', 'Bearbeiter Id', 'Vorgang',
      'Anmerkung', 'Minutendauer', 'Freigabestatus', 'Buchungszeitraum',
      'Bucher', 'ProduktPosition', 'OriginalProduktPosition', 'Metadaten'
    ];

    const csvContent = [
      headers.join(';'),
      headers.map(header => `"${this.selectedLogbuchEntry![header as keyof LogbuchEntry] || ''}"`).join(';')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `logbuch_entry_${this.currentLogbuchEntryIndex + 1}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
