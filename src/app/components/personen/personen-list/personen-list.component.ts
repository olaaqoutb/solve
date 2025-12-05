 import { AfterViewInit, Component, inject, Renderer2, ViewChild } from '@angular/core';
 import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, DatePipe } from '@angular/common';
 
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
  import { FlexLayoutModule } from '@angular/flex-layout';
  import { MatSnackBar } from '@angular/material/snack-bar';
  
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Person, Produkt } from '../../../models/person';
import { AttendanceEntry } from '../../../models/attendance.model';
import { OrganisationseinheitService } from '../../../services/organisationseinheit.service';
import { ProduktService } from '../../../services/produkt.service';
import { DateUtilsService } from '../../../services/utils/date-utils.service';
 import { TaetigkeitenHistorischService } from '../../../services/taetigkeiten-historisch.service';
import { AppUtilsService } from '../../../services/utils/app-utils.service';
import { TaetigkeitenHistorischDetailComponent } from '../../taetigkeiten-historisch/taetigkeiten-historisch-detail/taetigkeiten-historisch-detail.component';
import { PersonenService } from '../../../services/personen.service';
import { Router } from '@angular/router';
 

@Component({
  selector: 'app-personen-list',
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
  templateUrl: './personen-list.component.html',
  styleUrl: './personen-list.component.scss'
})
export class PersonenListComponent {
 displayedColumns: string[] = [
    'aktiv',
    'geprueft',
    'nachname',
    'vorname',
    'mitarbeiterart',
    'stundenkontingentJaehrlich',
    'stundenGeplantDiesesJahr',
    'stundenGebuchtDiesesJahr',
    'rolle'
  
   ];
 
   attendanceData: Person[] = [];
   filteredData: Person[] = [];
   searchTerm: string = '';
   showSideMenu: boolean = false;
   sideMenuType: 'phone' | 'info' | null = null;
   selectedEmployee: Person | null = null;
 
   private destroy$ = new Subject<void>();
 
   constructor(
     private personenService : PersonenService,
      private dateUtilsService: DateUtilsService,
      private router: Router,
     private dialog: MatDialog,
      private renderer: Renderer2
   ) {}
 
   ngOnInit(): void {
     this.loadPersonen();
   }
 
   loadPersonen(): void {
    this.personenService.loadPersonen().subscribe((data) => {
      console.log(data);
      this.attendanceData  = data;
      this.applyFilter();
      
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
         item.nachname?.toLocaleLowerCase().includes(filterValue) 
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
           return this.compare(a.nachname, b.nachname, isAsc);
         case 'vorname':
           return this.compare(a.nachname, b.nachname, isAsc);
         case 'mitarbeiterart':
           return this.compare(a.nachname, b.nachname, isAsc);
         default:
           return 0;
       }
     });
   }
 
   compare(a: string | number, b: string | number, isAsc: boolean): number {
     return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
   }

   openDetails(person : Person){
    console.log(person);
    this.router.navigate(['/personen', person.id]); // Navigate with ID
   }
 
   openDetailDialog(employee: AttendanceEntry): void {
     const dialogRef = this.dialog.open(TaetigkeitenHistorischDetailComponent, {
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

   getAktivClass(aktiv: boolean): string {
    return aktiv ? 'check-icon_green' : 'check-icon_red';
  }
 
  getAktivIcon(aktiv: boolean): string {
    return aktiv ? 'check' : 'close';
  }

  getGeprueftIcon(geprueft: boolean): string {
    return geprueft ? 'check_circle_outline' : 'help_outline';
  }
  
  getGeprueftClass(geprueft: boolean): string {
    return geprueft ? 'check-icon_green' : 'check-icon_red';
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
 
   callEmployee(employee: Person, event?: Event): void {
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
