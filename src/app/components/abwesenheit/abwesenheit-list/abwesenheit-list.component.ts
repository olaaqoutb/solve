import { AfterViewInit, Component, inject, Renderer2, ViewChild } from '@angular/core';


import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, DatePipe } from '@angular/common';
//import { AbwesenheitItem } from '../../../shared/models/abwesenheit';
//import { AbwesenheitService } from '../../../services/abwesenheit.service';
import { DateUtilsService } from '../../../services/utils/date-utils.service';
//import { StempelzeitDto } from '../../../shared/models/person';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
 import { MatGridListModule } from '@angular/material/grid-list';
import { AttendanceEntry } from '../../../models/attendance.model';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttendanceService } from '../../../services/attendance.service';
import { StempelzeitDto } from '../../../models/person';
import { AbwesenheitService } from '../../../services/abwesenheit.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog/delete-confirm-dialog.component';
@Component({
  selector: 'app-abwesenheit-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatGridListModule,
    
    CommonModule,
    FlexLayoutModule
  ],
  templateUrl: './abwesenheit-list.component.html',
  styleUrl: './abwesenheit-list.component.scss'
})
export class AbwesenheitListComponent {


  displayedColumns: string[] = ['login', 'logoff', 'actions'];


  dataSource = new MatTableDataSource<StempelzeitDto>();


 // dataSource = new MatTableDataSource<AbwesenheitItem>(AbwesenheitItemList);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private _liveAnnouncer = inject(LiveAnnouncer);
  selectedRow!: StempelzeitDto | undefined;
  selectedIndex!: number ;

  action: 'noAction' | 'add' | 'edit' | 'save' = 'noAction';
  editAction:  'edit' | 'save' = 'edit';
  deleteAction:  'delete' | 'cancel' = 'delete';

  formattedDate! : string ; 
  editButtonText = 'Bearbeiten';
  deleteButtonText = 'Löschen';

  isEditDisabled = true;
  iconEditType = 'edit';
  iconDeleteType = 'delete';
  
  hoveredRow: number = -1;
  
  constructor(private dialog: MatDialog, private datePipe: DatePipe, private abwesenheitService : AbwesenheitService){

  }
  announceSortChange(sortState: any) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }


  ngOnInit(): void {
    this.loadAbwesenheiten();
  }


  loadAbwesenheiten(): void {
    this.abwesenheitService.getAbwesenheitsListe().subscribe((data: StempelzeitDto[]) => {
        console.log('loadOrganisationseinheiten', data);
        this.dataSource.data = data;
      });
  }

  filter(event: Event) {
    const filter = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filter.trim().toLowerCase();
  }

  add() 
  {
    const now = new Date();
    const formattedDate = now.toISOString();
    console.log(formattedDate); // Example Output: 2025-07-01T00:00:00.000Z

   // this.formattedDate = this.datePipe.transform(now, 'yyyy-MM-dd dd.MM.yyyy HH:mm') as string;
  

    console.log( this.formattedDate);

    this.selectedRow = 
    {
      id : undefined,
      loginSystem: '',
      logoffSystem: '',
      login:   DateUtilsService.formatDateToISO(new Date(), true), // '2025-03-03T09:43:00.000',
      logoff: DateUtilsService.formatDateToISO(new Date(), false),
      anmerkung: '',
      zeitTyp: 'ABWESENHEIT',
      poKorrektur: true,
      marker: ['TEMP_ABWESENHEIT'],
      eintragungsart: 'NORMAL',
      person : {
        id : '343200000000078',
        vorname:"Hassan", nachname : 'Terab', 
        portalUser : 'terab01@bmi.gv.at',
        aktiv : true,
        vertrag : [],
        funktion : [],
        mitarbeiterart:'EXTERN', 
        personId : '',
        abwesenheitVorhanden : false,
        anwesend : '',
        recht:["STEMPELN","ONLINE_STEMPELN_HOMEOFFICE","ONLINE_STEMPELN_BUERO"], 
       }
    }

    if(this.selectedRow){
      console.log('login',  this.selectedRow.login);
  
     }else{
      console.log('login EMPTY Row' );
     }
    this.action = 'add';
  }

  editOrSave (){

    if(this.editAction === 'edit'){
      this.isEditDisabled = false;
      this.editButtonText = 'Speichern';
      this.deleteButtonText = 'Abbrechen';
      this.iconEditType = 'save';
      this.iconDeleteType = 'cancel';


      this.editAction = 'save';
    }else{
         // Save
      this.isEditDisabled = false;
      if(this.action === 'edit'){
        if (this.selectedRow) {
          this.selectedRow.login =  DateUtilsService.formatDateToISOFull( new Date(this.selectedRow.login));
          this.selectedRow.logoff =  DateUtilsService.formatDateToISOFull( new Date(this.selectedRow.logoff));
          console.log('login-X-Y',  this.selectedRow.login);
          console.log('logoff-X-Y',  this.selectedRow.logoff);
        }
      
        this.abwesenheitService.editAbwesenheit(this.selectedRow as StempelzeitDto).subscribe((data: StempelzeitDto[]) => {
          this.dataSource._updateChangeSubscription();
        });
        
      }else{
        if (this.selectedRow) {
          this.selectedRow.login = this.selectedRow.login + ':00.000';
          this.selectedRow.logoff = this.selectedRow.logoff + ':00.000';
        }
  
        this.abwesenheitService.createAbwesenheit(this.selectedRow as StempelzeitDto).subscribe((data: StempelzeitDto[]) => {
          this.dataSource.data.push(this.selectedRow as StempelzeitDto)
          this.dataSource._updateChangeSubscription();
        });
      }
      this.editButtonText = 'Bearbeiten';
      this.deleteButtonText = 'Löschen';
      this.iconEditType = 'edit';
      this.iconDeleteType = 'delete';

      this.editAction = 'edit';

    }
  }

  addNewItem(){
    this.dataSource.data.push(this.selectedRow as StempelzeitDto)
    this.dataSource._updateChangeSubscription();
    this.add();
  }


  openDeleteDialog(row: StempelzeitDto): void {
    if(this.deleteButtonText === 'Abbrechen'){
      this.deleteButtonText = 'Löschen';
      this.isEditDisabled = true;
    }else{
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        width: '500px',
        data: { row }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.delete(row, this.selectedIndex);
        }
      });
    }
  }

  cancelOrDelete(row: StempelzeitDto): void {
    if(this.deleteButtonText === 'Abbrechen'){
      this.deleteButtonText = 'Löschen';
      this.isEditDisabled = true;
    }else{
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        width: '500px',
        data: { row }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.delete(row, this.selectedIndex);
        }
      });
    }
  }

  delete(row: StempelzeitDto, index: number) {
    console.log('index', index);
    console.log('selected-row', row);
    row.deleted= true;
    this.abwesenheitService.deleteAbwesenheit(row).subscribe((data: StempelzeitDto[]) => {
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription();
      this.selectedRow = undefined;
      this.action = 'noAction'
    
    });
  }

  selectRow(index: number, row: StempelzeitDto) {
    this.selectedRow = row;
    this.action = 'edit';
    this.editAction = 'edit';
    this.selectedIndex = index;


    this.isEditDisabled = true;
    this.editButtonText = 'Bearbeiten';
    this.deleteButtonText = 'Löschen';
  }

  exportCalendar (index: number, row: StempelzeitDto){
    console.log('exportCalendar:TODO');

  }


  getIconClass(entry: AttendanceEntry): string {
 
    return 'user-active';
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
        return 'status-active';
    }
  }
}



function moment(dateString: any) {
  throw new Error('Function not implemented.');
}
