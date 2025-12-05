import {
  Component,
  inject,
  computed,
  signal,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceEntry } from '../../models/attendance.model';
import { DateUtilsService } from '../../services/utils/date-utils.service';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSortModule,
  ],
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.scss'],
})
export class AttendanceListComponent implements AfterViewInit {
  private dialog = inject(MatDialog);
  private attendanceService = inject(AttendanceService);



  displayedColumns = [
    'icon',
    'familienname',
    'vorname',
    'abwesendBis',
    'mitarbeiterart',
  ];
  dataSource: AttendanceEntry[] = [];
  loading = true;

  // Search/filter logic placeholder
  searchValue = '';

  // Sorting state
  currentSortActive = '';
  currentSortDirection = '';

  constructor (    private dateUtilsService: DateUtilsService){

  }
  ngAfterViewInit() {
    // Any post-view initialization code
  }

  sortData(sort: Sort) {
    this.currentSortActive = sort.active;
    this.currentSortDirection = sort.direction;

    // If there is no active sort or direction, return to original order
    if (!sort.active || sort.direction === '') {
      return;
    }

    // Sort the dataSource (which is the full dataset)
    this.dataSource = [...this.dataSource].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'familienname':
          return this.compare(a.familienname, b.familienname, isAsc);
        case 'vorname':
          return this.compare(a.vorname, b.vorname, isAsc);
        case 'abwesendBis':
          return this.compare(a.vorname, b.vorname, isAsc); // this.compare(a.abwesendBis, b.abwesendBis, isAsc);
        case 'mitarbeiterart':
          return this.compare(a.mitarbeiterart, b.mitarbeiterart, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: string | number, b: string | number, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  ngOnInit() {

    this.loadAttendanceData();

    // MOCK DATA for frontend development
   /* this.dataSource = [
      {
        icon: 'person',
        familienname: 'Adler',
        vorname: 'Nehat',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: 'extern',
        absences: [],
      },
      {
        icon: 'person',
        familienname: 'Aho',
        vorname: 'Jakob',
        abwesendBis: '',
        mitarbeiterart: 'Zivildienstleistender',
        status: '',
        absences: [],
      },
      {
        icon: 'person_off',
        familienname: 'Allum',
        vorname: 'Richard Thomas',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: '',
        absences: [
          {
            beginn: 'Mo. 26.05.2025 - 00:00',
            ende: 'Di. 10.06.2025 - 24:00',
            tage: 16,
          },
          {
            beginn: 'Fr. 20.06.2025 - 00:00',
            ende: 'Mo. 23.06.2025 - 24:00',
            tage: 4,
          },
          {
            beginn: 'Mo. 28.07.2025 - 00:00',
            ende: 'Mo. 04.08.2025 - 24:00',
            tage: 8,
          },
        ],
      },
      {
        icon: 'person_off',
        familienname: 'Altenberger',
        vorname: 'Peter',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: '',
        absences: [],
      },
      {
        icon: 'person',
        familienname: 'Altmann',
        vorname: 'Christian',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: 'error',
        absences: [
          {
            beginn: 'Mo. 26.05.2025 - 00:00',
            ende: 'Di. 10.06.2025 - 24:00',
            tage: 16,
          },
          {
            beginn: 'Fr. 20.06.2025 - 00:00',
            ende: 'Mo. 23.06.2025 - 24:00',
            tage: 4,
          },
          {
            beginn: 'Mo. 28.07.2025 - 00:00',
            ende: 'Mo. 04.08.2025 - 24:00',
            tage: 8,
          },
          {
            beginn: 'Mo. 18.08.2025 - 00:00',
            ende: 'Mo. 18.08.2025 - 24:00',
            tage: 1,
          },
          {
            beginn: 'Fr. 26.09.2025 - 00:00',
            ende: 'Mo. 06.10.2025 - 24:00',
            tage: 11,
          },
          {
            beginn: 'Mo. 03.11.2025 - 00:00',
            ende: 'Mo. 03.11.2025 - 24:00',
            tage: 1,
          },
          {
            beginn: 'Fr. 02.01.2026 - 00:00',
            ende: 'Mi. 07.01.2026 - 24:00',
            tage: 6,
          },
        ],
      },
      {
        icon: 'person',
        familienname: 'Ambrosch',
        vorname: 'Erwin',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: 'extern',
        absences: [],
      },
      {
        icon: 'person',
        familienname: 'Amon',
        vorname: 'Harald',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: 'extern',
        absences: [],
      },
      {
        icon: 'home',
        familienname: 'Angerer',
        vorname: 'Wolf-Dieter',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: 'extern',
        absences: [],
      },
      {
        icon: 'person_off',
        familienname: 'Arthaber',
        vorname: 'Roman',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: '',
        absences: [],
      },
      {
        icon: 'home',
        familienname: 'Auernig',
        vorname: 'Christoph',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: 'extern',
        absences: [],
      },
      {
        icon: 'home',
        familienname: 'Aumaier',
        vorname: 'Stefan',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: 'extern',
        absences: [],
      },
      {
        icon: 'person_off',
        familienname: 'Azar',
        vorname: 'Wael',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: '',
        absences: [],
      },
      {
        icon: 'person',
        familienname: 'Babjak',
        vorname: 'Matej',
        abwesendBis: '',
        mitarbeiterart: 'extern',
        status: 'extern',
        absences: [],
      },
    ];

    */
    this.loading = false;
  }

  loadAttendanceData(): void {
    // In a real application, use the actual service method
    // this.attendanceService.getAttendanceList()
    this.attendanceService.getPersonenAnweesnd().subscribe((data) => {
      this.dataSource = data;
    //  this.applyFilter();
      console.log(data);
      this.loading = false;

    });

     
  
  }


  // Use a computed property for filtered data
  get filteredData() {
    if (!this.searchValue) return this.dataSource;
    const val = this.searchValue.toLowerCase();
    return this.dataSource.filter(
      (row) =>
        row.familienname.toLowerCase().includes(val) ||
        row.vorname.toLowerCase().includes(val) ||
        row.mitarbeiterart.toLowerCase().includes(val)
    );
  }

  openAbsenceDialog(row: any): void {
    if (!row.absences || row.absences.length === 0) return;
    this.dialog.open(AbsenceDetailsDialogComponent, {
      data: row,
      width: '600px',
      panelClass: 'absence-dialog-panel',
    });


  }


  getMitarbeiterart(mitarbeiterart : string){
    if(mitarbeiterart === 'EXTERN') return 'extern';
    if(mitarbeiterart === 'ZIVILDIENSTLEISTENDER') return 'Zivildienstleistender';
    if(mitarbeiterart === 'INTERN') return 'intern';
    if(mitarbeiterart === 'EXTERN_OHNE_BAKS') return 'extern ohne BAKS';

    return 'Unbekannt - ' + mitarbeiterart;
  }

  createColumnAbwesendBis(person : AttendanceEntry){
      if(person.logoff){
      console.log('FOUND-Person', person);
       let date = new Date(person.logoff!);
        // console.log(date);
      if(date){
        return  this.dateUtilsService.formatEndAs24(date, 'EEE dd.MM.yyyy - HH:mm');
      }else{
        return '';
      }
     }else{
       return '';
    }
 
   }
}




// Updated dialog component
@Component({
  selector: 'app-absence-details-dialog',
  template: `
    <h2 mat-dialog-title>
      Abwesenheit von {{ data.vorname }} {{ data.familienname }}
    </h2>
    <mat-dialog-content>
      <div *ngIf="data.absences && data.absences.length > 0">
        <table class="absence-table">
          <thead>
            <tr>
              <th>Beginn</th>
              <th>Ende</th>
              <th>Tage</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let absence of data.absences">
              <td>{{ absence.beginn }}</td>
              <td>{{ absence.ende }}</td>
              <td>{{ absence.tage }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div *ngIf="!data.absences || data.absences.length === 0">
        <p>Keine Abwesenheiten vorhanden.</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Schließen</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
})
export class AbsenceDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
