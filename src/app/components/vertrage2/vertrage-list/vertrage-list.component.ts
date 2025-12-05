import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { VertrageService } from '../../../services/vertrage.service';
@Component({
  selector: 'app-vertrage-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSortModule,
  ],
  templateUrl: './vertrage-list.component.html',
  styleUrl: './vertrage-list.component.scss'
})
export class VertrageListComponent {
 dataSource = new MatTableDataSource<any>([]);

  produkte: any[] = [];
  searchTerm = '';
  showInactive = false;
  displayedColumns: string[] = ['verbraucht-werte-laden', 'zusatz', 'geplan', 'org-Einheit', 'verbrauchtDate'];

  sortState: { [key: string]: 'asc' | 'desc' } = {
    'verbraucht-werte-laden': 'asc',
    zusatz: 'asc',
    geplan: 'desc',
    'org-Einheit': 'desc',
    verbrauchtDate: 'desc'
  };

  constructor(private http: HttpClient, private router: Router,private vertrage:VertrageService) {
    this.loadData();
  }

  loadData() {
    this.vertrage.getVertrageDetails().subscribe({
      next: (data) => {
        console.log('Successfully fetched data:', data);
        this.produkte = data;
        this.filterData();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.produkte = [];
        this.filterData();
      },
    });
  }
  toggleSort(field: string) {
    // Toggle direction
    this.sortState[field] = this.sortState[field] === 'asc' ? 'desc' : 'asc';

    const direction = this.sortState[field];

    const sorted = [...this.dataSource.data].sort((a, b) => {
      let valueA = this.getSortValue(a, field);
      let valueB = this.getSortValue(b, field);

      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.dataSource.data = sorted;
  }

  // Helper method to get the correct value for sorting
  private getSortValue(item: any, field: string): any {
    switch (field) {
      case 'verbraucht-werte-laden':
        return (item.vertragsname || '').toString().toLowerCase();
      case 'zusatz':
        return (item.vertragszusatz || '').toString().toLowerCase();
      case 'geplan':
        return parseFloat(item.stundenGeplant) || 0;
      case 'org-Einheit':
        return (item.vertragsverantwortlicher?.organisationseinheit?.kurzBezeichnung || '').toString().toLowerCase();
      case 'verbrauchtDate':
        return (item[field] || '').toString().toLowerCase();
      default:
        return (item[field] || '').toString().toLowerCase();
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

  filterData() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.produkte.filter(p => {
      const matchesSearch =
        (p.vertragsname || '').toLowerCase().includes(term) ||
        (p.vertragszusatz || '').toLowerCase().includes(term) ||
        (p.vertragsverantwortlicher?.organisationseinheit?.kurzBezeichnung || '').toLowerCase().includes(term);
      const matchesActiveStatus = this.showInactive ? true : p.aktiv !== false;
      return matchesSearch && matchesActiveStatus;
    });

    this.dataSource.data = filtered;
    const sortedColumns = Object.keys(this.sortState).filter(key =>
      this.sortState[key] !== 'desc'
    );

    if (sortedColumns.length > 0) {
      this.toggleSort(sortedColumns[0]);
      this.toggleSort(sortedColumns[0]);
    }
  }

  onCheckboxChange() {
    this.filterData();
  }
  addProduct() {
    alert('Added');
  }

  goToDetails(row: any) {
    this.router.navigate(['/vertrag', row.id], {
      state: { produktData: row }
    });
  }
}
