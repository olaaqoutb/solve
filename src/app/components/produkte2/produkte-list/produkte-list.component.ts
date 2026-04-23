import { Component , ViewChild, AfterViewInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DummyService } from '../../../services/dummy.service';
import { ApiProdukt } from '../../../models-2/ApiProdukt';

@Component({
  selector: 'app-produkte-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSortModule,
    MatMenuModule,
  ],
  templateUrl: './produkte-list.component.html',
styleUrls: ['./produkte-list.component.scss'],

})
export class ProdukteListComponent {
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<ApiProdukt>([]);

  produkte: ApiProdukt[] = [];
  searchTerm = '';
  showInactive = false;
  displayedColumns: string[] = ['kurzName', 'produktname', 'start', 'ende'];

  listMenuItems = [
    { label: 'Produkte - Ergebnisverantwortliche', icon: 'mdi-file-pdf-box', action: 'Produkte-Ergebnisverantwortliche' },
    { label: 'Produkte - Durchführungsverantwortliche', icon: 'mdi-file-pdf-box', action: 'Produkte-Durchfuehrungsverantwortliche' },
    { label: 'Produkte - Servicemanager', icon: 'mdi-file-pdf-box', action: 'Produkte-Servicemanager' },
  ];

  onMenuAction(action: string): void {
    console.log('[ProdukteList] menu action:', action);
  }

  constructor(private dummyService: DummyService, private router: Router) {
    this.dummyService.getProdukte().subscribe({
      next: (response) => {
        const data = response.body ?? [];
        console.log('Successfully fetched data from DummyService:', data);
        this.produkte = this.sortData(data);
        this.filterData();
      },
      error: (err) => {
        console.error('Error fetching produkte list:', err);
        alert(err);
      },
    });
  }

ngAfterViewInit() {
  console.log('Sort initialized:', this.sort);
  this.dataSource.sort = this.sort;

  this.dataSource.sortingDataAccessor = (item: ApiProdukt, property: string): string | number => {
    const value = (item as Record<string, unknown>)[property];
    console.log('Sorting by:', property, 'Value:', value);
    switch (property) {
      case 'start':
      case 'ende':
        const date = value ? new Date(value as string) : null;
        console.log('Date value:', date);
        return date && !isNaN(date.getTime()) ? date.getTime() : 0;
      default:
        return (value ?? '').toString().toLowerCase();
    }
  };
}
  sortData(data: ApiProdukt[]): ApiProdukt[] {
    return data.sort((a, b) => {
      const nameA = a.kurzName?.toLowerCase() || '';
      const nameB = b.kurzName?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }

sortState: { [key: string]: 'asc' | 'desc' } = {
  kurzName: 'asc',
  produktname: 'asc',
  start: 'desc',
  ende: 'desc',
};
toggleSort(field: string) {
  // Toggle direction
  this.sortState[field] = this.sortState[field] === 'asc' ? 'desc' : 'asc';

  const direction = this.sortState[field];

  const sorted = [...this.dataSource.data].sort((a, b) => {
    const rawA = (a as Record<string, unknown>)[field];
    const rawB = (b as Record<string, unknown>)[field];
    let valueA: string | number;
    let valueB: string | number;

    if (field === 'start' || field === 'ende') {
      valueA = rawA ? new Date(rawA as string).getTime() : 0;
      valueB = rawB ? new Date(rawB as string).getTime() : 0;
    } else {
      valueA = (rawA ?? '').toString().toLowerCase();
      valueB = (rawB ?? '').toString().toLowerCase();
    }

    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  this.dataSource.data = sorted;
}


  filterData() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.produkte.filter(p => {
      const matchesSearch =
        (p.kurzName || '').toLowerCase().includes(term) ||
        (p.produktname || '').toLowerCase().includes(term);
      const matchesActiveStatus = this.showInactive ? true : p.aktiv !== false;
      return matchesSearch && matchesActiveStatus;
    });
    this.dataSource.data = filtered;
  }

  onCheckboxChange() {
    this.filterData();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterData();
  }

    addProduct(): void {
  this.router.navigate(['/produkte/new']);
}
 goToDetails(row: ApiProdukt) {
  this.router.navigate(['/produkte', row.id], {
    state: { produktData: row }
  });
}

}
