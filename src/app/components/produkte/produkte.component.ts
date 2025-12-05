import { AfterViewInit, Component, inject, Renderer2, ViewChild } from '@angular/core';
//import { AbwesenheitItem } from '../../shared/models';
import { HttpClient } from '@angular/common/http';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, DatePipe } from '@angular/common';
//import { AbwesenheitItem } from '../../../shared/models/abwesenheit';
//import { AbwesenheitService } from '../../../services/abwesenheit.service';
//import { DateUtilsService } from '../../../services/utils/date-utils.service';
//import { StempelzeitDto } from '../../../shared/models/person';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
//import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog/delete-confirm-dialog.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Organisationseinheit } from '../../models/organisationseinheit';
import { AttendanceEntry } from '../../models/attendance.model';
import { OrganisationseinheitDetailComponent } from '../organisationseinheit/organisationseinheit-detail/organisationseinheit-detail.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganisationseinheitService } from '../../services/organisationseinheit.service';
import { AttendanceService } from '../../services/attendance.service';
import { DateUtilsService } from '../../services/utils/date-utils.service';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ProduktService } from '../../services/produkt.service';
import { Produkt } from '../../models/person';

@Component({
  selector: 'app-produkte',
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
    FlexLayoutModule
  ],
  templateUrl: './produkte.component.html',
  styleUrl: './produkte.component.scss'
})
export class ProdukteComponent {

  displayedColumns: string[] = [
    'kurzName',
    'produktname',
    'start',
    'ende',
 
   ];
 
   attendanceData: Produkt[] = [];
   filteredData: Produkt[] = [];
   searchTerm: string = '';
   showSideMenu: boolean = false;
   sideMenuType: 'phone' | 'info' | null = null;
   selectedEmployee: Produkt | null = null;
 
   private destroy$ = new Subject<void>();
 
   constructor(
     private organisationseinheitService: OrganisationseinheitService,
     private produktService: ProduktService,
          private dateUtilsService: DateUtilsService,
     private dialog: MatDialog,
     private snackBar: MatSnackBar,
     private renderer: Renderer2
   ) {}
 
   ngOnInit(): void {
      this.loadProdukte();
   }
 
   loadProdukte(): void {

    this.produktService
    .getProdukte()
    .subscribe((data: Produkt[]) => {
       this.attendanceData  = data;
      this.applyFilter();
      console.log(data);

    });

    
  }

 
   
 
   ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
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
         item.produktname?.toLocaleLowerCase().includes(filterValue) 
       /*  item.nachname?.toLowerCase().includes(filterValue) ||
         item.vorname.toLowerCase().includes(filterValue) ||
         item.mitarbeiterart.toLowerCase().includes(filterValue)
         */
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
           return this.compare(a.produktname, b.produktname, isAsc);
         case 'vorname':
           return this.compare(a.produktname, b.produktname, isAsc);
         case 'mitarbeiterart':
           return this.compare(a.produktname, b.produktname, isAsc);
         default:
           return 0;
       }
     });
   }
 
   compare(a: string | number, b: string | number, isAsc: boolean): number {
     return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
   }
 
   openDetailDialog(employee: AttendanceEntry): void {
     const dialogRef = this.dialog.open(OrganisationseinheitDetailComponent, {
       width: '800px',
       data: { employee },
     });
 
     dialogRef.afterClosed().subscribe((result) => {
       if (result) {
         // Handle any updates if needed
       //  this.loadAttendanceData();
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
 
   getIconClass(entry: AttendanceEntry): string {
     if (entry.anwesend === 'ABWESEND') return 'user-active';
     if (entry.anwesend === 'inactive') return 'user-inactive';
     if (entry.anwesend === 'special') return 'user-special';
     return 'user-active';
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
       if(person.abwesenheitVorhanden){
         return 'Ende der Abwesenheit unbekannt';
       }else{
         return '';
       }
       
     }
  
    }
 
   callEmployee(employee: Produkt, event?: Event): void {
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
     
 
   }
}
