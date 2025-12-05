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
import { StempelzeitService } from '../../../services/stempelzeit.service';
@Component({
  selector: 'app-stempelzeit-list',
  standalone: true,
  imports: [
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
    HttpClientModule
  ],
  templateUrl: './stempelzeit-list.component.html',
  styleUrls: ['./stempelzeit-list.component.scss']
})
export class StempelzeitListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'icon',
    'famName',
    'vorName',
    'mita',
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
    famName: 'asc',
    vorName: 'asc',
    mita: 'asc'
  };

  constructor(
    private renderer: Renderer2,
    private http: HttpClient,
    private router: Router,
    private  stempelzeitService: StempelzeitService

  ) {}

  ngOnInit(): void {
    this.loadDataFromJson();
  }

  loadDataFromJson(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.stempelzeitService.getStempelzeiten().subscribe({
      next: (data) => {
        this.attendanceData = this.transformData(data);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data from JSON:', error);
        this.errorMessage = 'Fehler beim Laden der Daten';
        this.isLoading = false;
      }
    });
  }

  private transformData(data: any[]): Person[] {
    return data.map(item => {
      const vorname = item.vorName || item.vorname || item.firstName || '-';
      const nachname = item.famName || item.nachname || item.familyName || '-';
      const mitarbeiterart = item.mita || item.mitarbeiterart || item.employeeType || '-';

      return {
        id: item.id || Math.random().toString(),
        // New property names
        vorname: vorname,
        nachname: nachname,
        mitarbeiterart: mitarbeiterart,
        // Old property names (required by Person interface)
        vorName: vorname,
        famName: nachname,
        mita: mitarbeiterart,
        // Additional required properties
        rolle: item.rolle || '-',
        aktiv: item.aktiv !== undefined ? item.aktiv : true,
        anwesend: item.anwesend || 'active',
        logoff: item.logoff,
        abwesenheitVorhanden: item.abwesenheitVorhanden || false
      };
    });
  }

  ngOnDestroy(): void {}

  // addProduct(): void {
  //   console.log('Add product clicked');
  // }

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
        (item.nachname || '').toString().toLowerCase().includes(filterValue) ||
        (item.vorname || '').toString().toLowerCase().includes(filterValue) ||
        (item.mitarbeiterart || '').toString().toLowerCase().includes(filterValue)
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

    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
  getRowClass(row: Person): string {
    return row.aktiv === false ? 'inactive-row' : '';
  }
 toggleSort(field: string) {
  this.sortState[field] = this.sortState[field] === 'asc' ? 'desc' : 'asc';

  const direction = this.sortState[field];
  const sorted = [...this.filteredData].sort((a, b) => {
    let valueA = this.getSortValue(a, field);
    let valueB = this.getSortValue(b, field);

    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  this.filteredData = sorted;
  this.dataSource.data = this.filteredData;
}



  private getSortValue(item: any, field: string): string {
  let value = '';

  switch (field) {
    case 'famName':
      value = (item.famName || '').toString();
      break;
    case 'vorName':
      value = (item.vorName || '').toString();
      break;
    case 'mita':
      value = (item.mita || '').toString();
      break;
    default:
      value = (item[field] || '').toString();
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
    this.router.navigate(['/timestamps', row.id]);
  } else {
    console.error('Employee ID is missing');
  }
}

  openDetailDialog(employee: Person): void {
    console.log('openDetailDialog', employee);
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

  getMitarbeiterart(mitarbeiterart: string) {
    return mitarbeiterart;
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

  callEmployee(employee: Person, event?: Event): void {
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

    this.selectedEmployee = employee;
  }

}
