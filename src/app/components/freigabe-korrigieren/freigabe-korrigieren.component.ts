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
import { FreigabeKorrigierenService } from '../../services/freigabe-korrigieren.service';
import { ActivatedRoute } from '@angular/router';

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
  kurzName?: string;
  produktPositionName?: string;
}

interface TimeEntryDetail {
  Datum: string;
  Buchungspunkt: string;
  Tatigkeit: string;
  Stunden: string;
  id?: string;
}
//  interface for JSON data structure
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
  };
  bucher: {
    vorname: string;
    nachname: string;
  };

}

@Component({
  selector: 'app-freigabe-korrigieren',
  standalone: true,
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
  ],
  templateUrl: './freigabe-korrigieren.component.html',
  styleUrls: ['./freigabe-korrigieren.component.scss'],
})
export class FreigabeKorrigierenComponent implements OnInit {
  dropdownOptions: string[] = ['Projectoffice', 'Abteilungsleiter'];
  selectedOption: string = this.dropdownOptions[0];
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
  sortState: { [key: string]: 'asc' | 'desc' } = {
    Produktposition: 'asc',
    Monat: 'asc',
    Mitarbeiter: 'asc',
    Std: 'asc',
  };
  freigabeId!: string;
   detailSortState: { [key: string]: 'asc' | 'desc' } = {
    Datum: 'asc',
    Buchungspunkt: 'asc',
    Tatigkeit: 'asc',
    Stunden: 'asc',
  };
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

  constructor(private http: HttpClient,private freigabeKorrigierenService: FreigabeKorrigierenService,private route: ActivatedRoute) {}

 ngOnInit() {
   this.freigabeId = this.route.snapshot.paramMap.get('id')!;
  this.loadJsonData();
    this.loadData();
}


 loadJsonData() {
this.freigabeKorrigierenService.getFreigabe().subscribe({
    next: (data:any) => {
      this.jsonData = data;
      console.log('Loaded JSON data:', this.jsonData);
    },
    error: (error) => {
      console.error('Error loading JSON data:', error);
    }
  });
}


formatProduktPositionDisplay(produktPositionName: string, kurzName: string): string {
  // نجمع القيم اللي ليها محتوى فقط
  const parts = [produktPositionName, kurzName].filter(v => v && v.trim() !== '');
  // لو في قيم ندمجهم بـ » ، لو مفيش نرجع No
  return parts.length ? parts.join(' » ') : 'No';
}


private formatProduktPositionForSorting(
  produktPositionName: string,
  kurzName: string,
  originalPosition: string
): string {
  // Build the current part: "Betrieb ZMR"
  const currentPart = kurzName !== 'NoValue'
    ? `${produktPositionName} ${kurzName}`
    : produktPositionName;

  if (originalPosition && originalPosition.trim() !== '' && originalPosition !== produktPositionName) {
    return `${originalPosition} >> ${currentPart}`;
  }

  return currentPart;
}
loadData() {
  this.freigabeKorrigierenService.getFreigabeById(this.freigabeId).subscribe({
    next: (data:any) => {
      const mappedData = data.map((item:any) => {
        const produktPositionName = this.extractProduktPositionName(item);
        const kurzName = this.extractKurzName(item);

        return {
          Produktposition: this.formatProduktPositionDisplay(produktPositionName, kurzName),
          Monat: this.formatMonth(item.buchungsZeitraum),
          Mitarbeiter: item.bucher
            ? `${item.bucher.vorname} ${item.bucher.nachname}`
            : 'Unbekannt',
          Std: this.formatMinutesToHoursMinutes(item.minutenDauer),
          anmerkung: item.anmerkung,
          id: item.id,
          minutenDauer: item.minutenDauer,
          freigabeStatus: item.freigabeStatus,
          metadaten: item.metadaten,
          produktPosition: item.produktPosition,
          kurzName: kurzName,
          produktPositionName: produktPositionName,
          produktPositionDisplay: this.formatProduktPositionDisplay(produktPositionName, kurzName),
        };
      });

      this.originalDataSource = [...mappedData];
      this.applyFilter(this.selectedOption);
    },
    error: (error) => console.error('Error loading list data:', error)
  });
}



// Comprehensive method to extract produktPositionName from ANY location in the JSON
private extractProduktPositionName(item: any): string {
  console.log('Extracting produktPositionName from:', item);

  // Check all possible locations in order of priority
  if (item.produktPositionName && item.produktPositionName.trim() !== '') {
    console.log('Found in root produktPositionName:', item.produktPositionName);
    return item.produktPositionName;
  }

  if (item.produktPosition?.produktPositionname && item.produktPosition.produktPositionname.trim() !== '') {
    console.log('Found in nested produktPosition.produktPositionname:', item.produktPosition.produktPositionname);
    return item.produktPosition.produktPositionname;
  }

  if (item.produktPositionName) {
    console.log('Found in root (empty):', item.produktPositionName);
    return item.produktPositionName;
  }

  console.log('No produktPositionName found, returning NoValue');
  return 'NoValue';
}

// Comprehensive method to extract kurzName from ANY location in the JSON
private extractKurzName(item: any): string {
  console.log('Extracting kurzName from:', item);

  // Check all possible locations in order of priority
  if (item.kurzName && item.kurzName.trim() !== '') {
    console.log('Found in root kurzName:', item.kurzName);
    return item.kurzName;
  }

  if (item.produktPosition?.produkt?.kurzName && item.produktPosition.produkt.kurzName.trim() !== '') {
    console.log('Found in nested produktPosition.produkt.kurzName:', item.produktPosition.produkt.kurzName);
    return item.produktPosition.produkt.kurzName;
  }

  if (item.kurzName) {
    console.log('Found in root (empty):', item.kurzName);
    return item.kurzName;
  }

  console.log('No kurzName found, returning NoValue');
  return 'NoValue';
}

// Extract original position from metadata
private extractOriginalPosition(item: any): string {
  if (item.metadaten?.originalProduktPosition &&
      item.metadaten.originalProduktPosition.trim() !== '' &&
      item.metadaten.originalProduktPosition !== 'none') {
    return item.metadaten.originalProduktPosition;
  }
  return '';
}

formatProduktPosition(item: any): string {
  const currentPosition = item.produktPositionName || 'N/A';
  const productShortName = item.kurzName || '';
  const originalPosition = item.metadaten?.originalProduktPosition;

  let display = currentPosition;

  if (productShortName && productShortName.trim() !== '') {
    display += ` (${productShortName})`;
  }

  if (originalPosition && originalPosition !== currentPosition) {
    display = `${originalPosition} → ${display}`;
  }

  return display;
}


// getOriginalPosition(element: TimeEntry): string {
//   const original = element.metadaten?.originalProduktPosition;
//   return original && original.trim() !== '' ? original : 'none';
// }

getCurrentPosition(element: TimeEntry): string {
  const currentPosition = element.produktPosition?.produktPositionname || 'N/A';
  const productShortName = element.produktPosition?.produkt?.kurzName || '';

  if (productShortName && productShortName.trim() !== '') {
    return `${currentPosition} (${productShortName})`;
  }

  return currentPosition;
}
getPlainCurrentPosition(element: TimeEntry): string {
  return element.produktPositionName || element.produktPosition?.produktPositionname || 'N/A';
}


shouldShowOriginalPosition(element: TimeEntry): boolean {
  const original = this.getOriginalPosition(element);
  const current = element.produktPositionName || 'N/A';

  return !!original && original !== current && original !== 'N/A' && original !== 'none';
}

hasRealOriginalPosition(element: TimeEntry): boolean {
  const original = element.metadaten?.originalProduktPosition;
  return !!(original && original.trim() !== '');
}


  loadDetailedData(entryId: string) {
    this.isLoading = true;
    this.http.get<any[]>('response_freigabe_korrigieren_detail_1_.json').subscribe({
      next: (data) => {
        this.isLoading = false;
        this.detailedData = data.map((item) => ({
          Datum: item.datum ? this.formatDate(item.datum) : '',
          Buchungspunkt: item.buchungspunkt?.buchungspunkt || 'Wartung',
          Tatigkeit: item.taetigkeit || '',
          Stunden: this.formatMinutesToHoursMinutes(item.minutenDauer),
          id: item.id,
        }));
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

    // Find the corresponding JSON data for the selected entry
    const jsonEntry = this.jsonData.find(item => item.id === entry.id);
    if (jsonEntry) {
      // You can use this data to populate the form
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
      return { color: 'red' };
    case 'PRUEFEN_EV':
      return { color: '#0c4450' };
    case 'PRUEFEN_DV':
      return { color: '#666' };
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

 cancelEdit() {
  this.isEditMode = false;
  if (this.selectedEntry && this.selectedEntry.id) {
    const originalEntry = this.dataSource.find(entry => entry.id === this.selectedEntry!.id);
    if (originalEntry) {
      this.selectedEntry = JSON.parse(JSON.stringify(originalEntry));
    }
  }
}

applyFilter(option: string) {
    console.log('Filtering by:', option);

    if (!this.originalDataSource.length) {
      console.warn('No data available to filter');
      return;
    }

    switch(option) {
      case 'Projectoffice':
        // Filter for ABGELEHNT status
        this.dataSource = this.originalDataSource.filter(item =>
          item.freigabeStatus === 'ABGELEHNT' || item.freigabeStatus === 'PRUEFEN_DV'
        );
        break;

      case 'Abteilungsleiter':
        // Filter for PRUEFEN_EV status
        this.dataSource = this.originalDataSource.filter(item =>
          item.freigabeStatus === 'PRUEFEN_EV'
        );
        break;

      default:
        this.dataSource = [...this.originalDataSource];
    }

    console.log('Filter result:', this.dataSource.length, 'items');

    this.selectedEntry = null;
    this.detailedData = [];

    // Apply default sorting
    this.applySorting('Produktposition');
  }
onDropdownChange() {
    this.applyFilter(this.selectedOption);
  }

getProductShortName(element: TimeEntry): string {
  return element.kurzName || element.produktPosition?.produkt?.kurzName || '';
}

debugEntry(entry: TimeEntry) {
  console.log('Entry debug:', {
    id: entry.id,
    produktPositionName: entry.produktPositionName,
    kurzName: entry.kurzName,
    fullDisplay: entry.Produktposition,
    metadaten: entry.metadaten
  });
}
// Helper method to check if should show original position
hasOriginalPosition(element: TimeEntry): boolean {
  const original = element.metadaten?.originalProduktPosition;
  const current = element.produktPositionName;

  return !!original &&
         original.trim() !== '' &&
         original !== 'none' &&
         original !== current;
}

// Helper method to get original position
getOriginalPosition(element: TimeEntry): string {
  return element.metadaten?.originalProduktPosition || '';
}

}
