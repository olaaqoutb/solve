 import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AttendanceService } from '../../../services/attendance.service';
import { AttendanceEntry, AbsencePeriod } from '../../../models/attendance.model';
 import { DateUtilsService } from '../../../services/utils/date-utils.service';
import { AnwesenheitslisteDetailsComponent } from '../anwesenheitsliste-details/anwesenheitsliste-details.component';
import { MatMenuModule } from '@angular/material/menu';
import { AppUtilsService } from '../../../services/utils/app-utils.service';

@Component({
  selector: 'app-anwesenheitsliste-list',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,

    MatDialogModule,
  ],
  templateUrl: './anwesenheitsliste-list.component.html',
  styleUrl: './anwesenheitsliste-list.component.scss'
})
export class AnwesenheitslisteListComponent {
  displayedColumns: string[] = [
    'icon',
    'familienname',
    'vorname',
    'abwesendBis',
    'mitarbeiterart',
    'actions',
  ];
  attendanceData: AttendanceEntry[] = [];
  filteredData: AttendanceEntry[] = [];
  searchTerm: string = '';
  showSideMenu: boolean = false;
  sideMenuType: 'phone' | 'info' | null = null;
  selectedEmployee: AttendanceEntry | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private attendanceService: AttendanceService,
    private dateUtilsService: DateUtilsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadAttendanceData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAttendanceData(): void {
    // In a real application, use the actual service method
    // this.attendanceService.getAttendanceList()
    this.attendanceService.getPersonenAnweesnd().subscribe((data) => {
      this.attendanceData = data;
      this.applyFilter();
      console.log(data);
    });

    /*
    this.attendanceService
      .getMockAttendanceList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.attendanceData = data;
        this.applyFilter();
      });
      */
  }

  applyFilter(): void {
    console.log('applyFilter');
    if (!this.searchTerm) {
      this.filteredData = [...this.attendanceData];
      return;
    }

    const filterValue = this.searchTerm.toLowerCase();
    console.log('applyFilter-filterValue', filterValue);

    this.filteredData = this.attendanceData.filter(
      (item) =>
        item.nachname?.toLowerCase().includes(filterValue) ||
        item.vorname.toLowerCase().includes(filterValue) ||
        item.mitarbeiterart.toLowerCase().includes(filterValue)
    );
  }

  sortData(sort: Sort): void {
    const data = [...this.filteredData];

    if (!sort.active || sort.direction === '') {
      this.filteredData = data;
      return;
    }

    this.filteredData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'familienname':
          return this.compare(a.familienname, b.familienname, isAsc);
        case 'vorname':
          return this.compare(a.vorname, b.vorname, isAsc);
        case 'mitarbeiterart':
          return this.compare(a.mitarbeiterart, b.mitarbeiterart, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  openDetailDialog(employee: AttendanceEntry): void {
    const dialogRef = this.dialog.open(AnwesenheitslisteDetailsComponent, {
      width: '800px',
      data: { employee },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle any updates if needed
        this.loadAttendanceData();
      }
    });
  }

  toggleSideMenu(type: 'phone' | 'info'): void {
    if (this.showSideMenu && this.sideMenuType === type) {
      this.showSideMenu = false;
      this.sideMenuType = null;
      // Reset selected employee when closing the menu
      this.selectedEmployee = null;
    } else {
      this.showSideMenu = true;
      this.sideMenuType = type;
    }
  }

  getStatusClass(status?: string): string {
  //  console.log('status', status);

    if (!status) return '';

    switch (status) {
      case 'UNBEKANNT' :
        return 'status-inactive';
      case 'ABWESEND' : 
        return 'status-active';
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

  getIconClass(entry: AttendanceEntry): string {
    if (entry.anwesend === 'ABWESEND') return 'user-active';
    if (entry.anwesend === 'inactive') return 'user-inactive';
    if (entry.anwesend === 'special') return 'user-special';
    return 'user-active';
  }

  getMitarbeiterart(mitarbeiterart : string){
    return AppUtilsService.getMitarbeiterart(mitarbeiterart);
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
      if(person.abwesenheitVorhanden){
        return 'Ende der Abwesenheit unbekannt';
      }else{
        return '';
      }
      
    }
 
   }

  callEmployee(employee: AttendanceEntry, event?: Event): void {
    // Get any previously selected elements and remove 'calling' class
    const previousCallingElements = document.querySelectorAll(
      '.phone-list-item.calling'
    );
    previousCallingElements.forEach((element) => {
      this.renderer.removeClass(element, 'calling');
    });

    // If event exists, add 'calling' class to clicked item for animation effect
    if (event) {
      const element = event.currentTarget as HTMLElement;
      this.renderer.addClass(element, 'calling');

      // Remove the class after the animation completes
      setTimeout(() => {
        this.renderer.removeClass(element, 'calling');
      }, 2000);
    }

    this.selectedEmployee = employee;
    const phoneNumber = `+43 1 234567-${employee.id * 111}`;

    this.snackBar.open(
      `Calling ${employee.vorname} ${employee.familienname}: ${phoneNumber}`,
      'Dismiss',
      {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['call-snackbar'],
      }
    );

    // In a real app, you would integrate with a calling API here
    console.log(
      `Calling ${employee.vorname} ${employee.familienname}: ${phoneNumber}`
    );
  }
}
