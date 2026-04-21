import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { Person } from "../../../models/person";
import { MatCellDef, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatHeaderRowDef } from "@angular/material/table";
import { DummyService } from '../../../services/dummy.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiMitarbeiterart } from '../../../models-2/ApiMitarbeiterart';
import { ApiRolle } from '../../../models-2/ApiRolle';
@Component({
  selector: 'app-personen-list',
  imports: [
    MatCellDef,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatHeaderRowDef,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule,
    FlexLayoutModule,
    MatCheckboxModule,
    HttpClientModule,
    MatTooltipModule
  ],
  templateUrl: './personen-list.component.html',
  styleUrl: './personen-list.component.scss'
})
export class PersonenListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'iconcheck',
     'statusIcon',
    'nachname',
    'vorname',
    'mitarbeiterart',
    'gesamt',
    'geplant',
    'gebucht',
    'geplant2026',
    'rolle',

  ];

  attendanceData: Person[] = [];
  filteredData: Person[] = [];
  dataSource = new MatTableDataSource<Person>();
  searchTerm: string = '';
  showInactive: boolean = false;
  showSideMenu: boolean = false;
  sideMenuType: 'phone' | 'info' | null = null;
  selectedEmployee: Person | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  sortState: { [key: string]: 'asc' | 'desc' } = {
    aktiv: 'asc',
  geprueft: 'asc',
  nachname: 'asc',
  vorname: 'asc',
  mitarbeiterart: 'asc',
  gesamt: 'asc',
  geplant: 'asc',
  gebucht: 'asc',
  geplant2026: 'asc',
  rolle: 'asc'
  };
menuOptions: any;
  private rolleDisplayMap!: Map<string, string>;
private mitarbeiterartDisplayMap!: Map<string, string>;


  constructor(
    private renderer: Renderer2,
    private http: HttpClient,
    private router: Router,
    private dummyService: DummyService
  ) { }

  ngOnInit(): void {
  // Build display maps: JSON stores enum member names (e.g. "INTERN", "DEFAULT"),
  // so map those to the enum values (e.g. "intern", "Default") for display.
  this.rolleDisplayMap = new Map(
    Object.keys(ApiRolle).map(key => [key, ApiRolle[key as keyof typeof ApiRolle]])
  );
  this.mitarbeiterartDisplayMap = new Map(
    Object.keys(ApiMitarbeiterart).map(key => [key, ApiMitarbeiterart[key as keyof typeof ApiMitarbeiterart]])
  );

  this.loadDataFromJson();
}
menuItems = [
  { label: 'Personenliste Alle',mdiIcon: 'mdi-file-excel-box' },
  { label: 'Personenliste Aktuelle',mdiIcon: 'mdi-file-excel-box' },
  { label: 'Informationen hochladen',mdiIcon: 'mdi-file-pdf-box' },
  { label: 'Konflikte-Erhebungs Formular hochladen',mdiIcon: 'mdi-file-pdf-box' },
];
onMenuOptionSelected(option: { label: string; mdiIcon: string }): void {
  console.log('Selected:', option.label);
}
getMitarbeiterartDisplay(value: string): string {
  if (!value) return '';
  return this.mitarbeiterartDisplayMap?.get(value) ?? value;
}

getRolleDisplay(value: string): string {
  if (!value) return '';
  return this.rolleDisplayMap?.get(value) ?? value;
}
  loadDataFromJson(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dummyService.getPersonenn().subscribe({
      next: (data: any[]) => {
        this.attendanceData = this.transformData(data);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading data from JSON:', error);
        this.errorMessage = 'Fehler beim Laden der Daten';
        this.isLoading = false;
      }
    });
  }

private transformData(data: any[]): Person[] {
  return data.map(item => {
    const vorname = item.vorname || '-';
    const nachname = item.nachname || '-';
    const mitarbeiterart = item.mitarbeiterart || '-';

    return {
      id: item.id || Math.random().toString(),
      // Required properties
      vorname: vorname,
      nachname: nachname,
      aktiv: item.aktiv !== undefined ? item.aktiv : true,
      // Optional properties with proper typing
      mitarbeiterart: mitarbeiterart,
      anwesend: item.anwesend || 'active',
      logoff: item.logoff,
      abwesenheitVorhanden: item.abwesenheitVorhanden || false,
      // Numeric properties with proper typing
      gesamt: this.parseNumber(item.gesamt, item.stundenkontingentJaehrlich),
      geplant: this.parseNumber(item.geplant),
      gebucht: this.parseNumber(item.gebucht),
      geplant2026: this.parseNumber(item.geplant2026),
      rolle: item.rolle || 'DEFAULT',
      // Other optional properties
      familienname: nachname,
      status: item.status as 'active' | 'inactive' | undefined,
geprueft: item.geprueft ?? false,
    };
  });
}

private parseNumber(...values: any[]): number {
  for (const value of values) {
    const num = Number(value);
    if (!isNaN(num)) return num;
  }
  return 0;
}
  ngOnDestroy(): void { }

  onCheckboxChange(): void {
    this.applyFilter();
  }

  filterdata(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.attendanceData];

    if (this.searchTerm) {
      const filterValue = this.searchTerm.toLowerCase();
      filtered = filtered.filter((item: Person) =>
        (item.nachname || '').toString().toLowerCase().includes(filterValue) ||     // changed from famName
        (item.vorname || '').toString().toLowerCase().includes(filterValue) ||      // changed from vorName
        (item.mitarbeiterart || '').toString().toLowerCase().includes(filterValue) || // changed from mita
        (item.rolle || '').toString().toLowerCase().includes(filterValue)
      );
    }

    if (!this.showInactive) {
      filtered = filtered.filter(item => item.aktiv === true);
    }

    this.filteredData = this.applySorting(filtered);
    this.dataSource.data = this.filteredData;
  }

  private applySorting(data: Person[]): Person[] {
  const sortedField = Object.keys(this.sortState).find(field =>
    this.sortState[field] === 'asc' || this.sortState[field] === 'desc'
  );

  if (!sortedField) return data;

  const direction = this.sortState[sortedField];

  return [...data].sort((a, b) => {
    let valueA = this.getSortValue(a, sortedField);
    let valueB = this.getSortValue(b, sortedField);
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    }

    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

  getRowClass(row: Person): string {
  return row.aktiv === true ? 'active-row' : 'inactive-row';
  }

  toggleSort(field: string) {
  this.sortState[field] = this.sortState[field] === 'asc' ? 'desc' : 'asc';

  const direction = this.sortState[field];
  const sorted = [...this.filteredData].sort((a, b) => {
    let valueA = this.getSortValue(a, field);
    let valueB = this.getSortValue(b, field);

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    }

    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  this.filteredData = sorted;
  this.dataSource.data = this.filteredData;
}

private getSortValue(item: any, field: string): string | number {
  // Numeric fields
  if (['gesamt', 'geplant', 'gebucht', 'geplant2026'].includes(field)) {
    return item[field] ?? 0;
  }

  // Boolean fields — fall back to nachname so ties sort by family name
  if (field === 'aktiv' || field === 'geprueft') {
    return this.getSortValue(item, 'nachname');
  }

  let value = '';
  switch (field) {
    case 'nachname':        value = item.nachname || ''; break;
    case 'vorname':         value = item.vorname || ''; break;
    case 'mitarbeiterart':  value = item.mitarbeiterart || ''; break;
    case 'rolle':           value = item.rolle || ''; break;
    default:                value = (item[field] || '').toString();
  }

  return value.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ä/g, 'a')
    .replace(/ß/g, 'ss');
}

  getSortIcon(column: string): string {
    if (this.sortState[column] === 'asc') {
      return 'keyboard_arrow_up';
    } else if (this.sortState[column] === 'desc') {
      return 'keyboard_arrow_down';
    }
    return 'swap_vert';
  }

  compare(a: string | number | boolean, b: string | number | boolean, isAsc: boolean): number {
    const aStr = String(a || '').toLowerCase();
    const bStr = String(b || '').toLowerCase();

    if (aStr < bStr) return isAsc ? -1 : 1;
    if (aStr > bStr) return isAsc ? 1 : -1;
    return 0;
  }

  goToDetails(row: Person): void {
    console.log('Navigate to details:', row);

    if (row.id) {
      this.router.navigate(['/edit-personen', row.id]);
    } else {
      console.error('Person ID is missing');
    }
  }

  openDetailDialog(person: Person): void {
    console.log('openDetailDialog', person);
  }

  toggleSideMenu(type: 'phone' | 'info'): void {
    if (this.showSideMenu && this.sideMenuType === type) {
      this.showSideMenu = false;
      this.sideMenuType = null;
      this.selectedEmployee = null;
    } else {
      this.showSideMenu = true;
      this.sideMenuType = type;
    }
  }

  getStatusClass(status?: string): string {
    if (!status) return '';
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'special':
        return 'status-special';
      default:
        return '';
    }
  }

  getIconClass(entry: Person): string {
    if (!entry) return 'user-active';
    if (entry.anwesend === 'ABWESEND') return 'user-inactive';
    if (entry.anwesend === 'inactive') return 'user-inactive';
    if (entry.anwesend === 'special') return 'user-special';
    return 'user-active';
  }

  createColumnAbwesendBis(person: Person) {
    if (!person) return '';
    if (person.logoff) {
      try {
        const date = new Date(person.logoff);
        return isNaN(date.getTime()) ? '' : date.toLocaleString();
      } catch {
        return '';
      }
    } else {
      if (person.abwesenheitVorhanden) {
        return 'Ende der Abwesenheit unbekannt';
      } else {
        return '';
      }
    }
  }

  callEmployee(person: Person, event?: Event): void {
    const previousCallingElements = document.querySelectorAll('.phone-list-item.calling');
    previousCallingElements.forEach((element) => {
      this.renderer.removeClass(element, 'calling');
    });

    if (event) {
      const element = event.currentTarget as HTMLElement;
      this.renderer.addClass(element, 'calling');
      setTimeout(() => {
        this.renderer.removeClass(element, 'calling');
      }, 2000);
    }

    this.selectedEmployee = person;
  }
  getStatusIcon(entry: Person): string {
  if (!entry) return 'cancel';

  // Red icon for inactive persons
  if (entry.aktiv === false) {
    return 'cancel';
  }

  // Green icon for active persons
  return 'check_circle';
}

getStatusIconClass(entry: Person): string {
  if (!entry) return 'status-icon-red';

  // Red for inactive
  if (entry.aktiv === false) {
    return 'status-icon-red';
  }

  // Green for active
  return 'status-icon-green';
}
createPerson(): void {
  this.router.navigate(['/personen/new']);
}
}
