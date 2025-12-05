import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Datalistorganizationanc } from '../../../models/datalistorganizationanc';
import { Router } from '@angular/router';
import { SharedDataServiceService } from '../../organisition/organisation-service/organisetion-service.service';
import { DataoforganizationlistService } from '../../organisition/dataoforganisation-list.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-presons-list',
 imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  templateUrl: './presons-list.component.html',
  styleUrl: './presons-list.component.scss'
})
export class PresonsListComponent implements OnInit {
  @Output() organisationseinheitSelected = new EventEmitter<string>();
  dataSource: MatTableDataSource<Datalistorganizationanc> = new MatTableDataSource();
  includeInactive: boolean = false;
  displayedColumns: string[] = [
    'kurzbezeichnung',
    'bezeichnung',
    'leitung',
    'uebergeordneteEinheit',
    'gueltigVon',
    'gueltigBis',
  ];
  searchTerm: string = '';
  isWhiteBg: boolean = true;
  datalistoftaple: Datalistorganizationanc[] = [];
  selectedRows: Datalistorganizationanc[] = [];

  constructor(
    private dataoforganizationlistService: DataoforganizationlistService,
    private router: Router,
    private sharedDataService: SharedDataServiceService
  ) { }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  resetFilter(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  createOrganisationseinheit(): void {
    this.sharedDataService.clearSelectedOrganization();

    this.router.navigate(['/organization/new']);
  }

  toggleInactive(): void {

    if (this.includeInactive) {
      this.dataSource.data = this.dataoforganizationlistService.getAllData();
    } else {
      this.dataSource.data = this.dataoforganizationlistService.getActiveData();
    }

    this.applyFilter();
  }


  ngOnInit(): void {
    this.dataSource.data = this.dataoforganizationlistService.getActiveData();
    this.dataSource.filterPredicate = (data: Datalistorganizationanc, filter: string) => {
      return (
        data.kurzBezeichnung?.toLowerCase().includes(filter) ||
        data.bezeichnung?.toLowerCase().includes(filter)
      );
    };
    this.reloadData();
  }
  reloadData() {
    this.dataSource.data = this.dataoforganizationlistService.getActiveData();
  }

  selectRow(row: Datalistorganizationanc): void {
    this.selectedRows = [row]; // Clear previous selections and select only the current row
    this.sharedDataService.setSelectedOrganization(row);
    this.router.navigate(['/organization/new']);
  }
}