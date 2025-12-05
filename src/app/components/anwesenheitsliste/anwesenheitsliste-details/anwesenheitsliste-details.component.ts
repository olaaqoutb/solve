 import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { AttendanceService } from '../../../services/attendance.service';
import {
  AttendanceEntry,
  AbsencePeriod,
 } from '../../../models/attendance.model';
import { DateUtilsService } from '../../../services/utils/date-utils.service';

@Component({
  selector: 'app-anwesenheitsliste-details',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './anwesenheitsliste-details.component.html',
  styleUrl: './anwesenheitsliste-details.component.scss'
})
export class AnwesenheitslisteDetailsComponent {
  employee: AttendanceEntry;
  absencePeriods: AbsencePeriod[] = [];
  displayedColumns: string[] = ['beginn', 'ende', 'tage'];

  constructor(
    private dialogRef: MatDialogRef<AnwesenheitslisteDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: AttendanceEntry },
    private attendanceService: AttendanceService,
    private dateUtilsService: DateUtilsService

  ) {
    this.employee = data.employee;
  }

  ngOnInit(): void {
    this.loadAbsencePeriods();
  }

  loadAbsencePeriods(): void {
    console.log('EMPLPOYEE', this.employee);
    this.attendanceService.getPersonAnwersenheitsListe( this.employee.personId!).subscribe( ( res) => {
      console.log(res);
      this.absencePeriods = res;
      const now = new Date();

      this.absencePeriods = res.filter(item => {
        if (!item.logoff) return true; // null, undefined, or empty string → show it
      
        const logoffDate = new Date(item.logoff);
      
        // Check for valid date and whether it's in the future
        return logoffDate.toString() !== 'Invalid Date' && logoffDate > now;
      });
/*
      this.absencePeriods = res.filter(item => {
        const loginDate = new Date(item.login!);
        return loginDate > now; // true if loginDate is in the future
      });
      */
    });
 
  }
 



  close(): void {
    this.dialogRef.close();
  }
  
  formatDate(date: string): string {
    return this.dateUtilsService.formatDate(date, 'EE dd.MM.yyyy - HH:mm');
  }

  calculateTage(row : AbsencePeriod) : string{
    console.log('row.login', row.login);
    console.log('row.logoff', row.logoff);
    
    if(row.login === undefined || row.logoff === undefined ){
      return '';
    }else{
      const days = this.attendanceService.calculateDays(new Date(row.login!), new Date(row.logoff!));
      console.log("Days: " + days);
      if (days == null) {
        return '';  
      }
      return days.toString();
  
    }
  }
}
