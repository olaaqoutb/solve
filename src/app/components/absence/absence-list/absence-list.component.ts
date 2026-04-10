import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AbsenceService } from '../../../services/absence.service';
import { AbsenceTableDto } from '../../../models/absence.interface';
// import { AbwesenheitService } from '../../../services/abwesenheit.service';
import{DummyService}from"../../../services/dummy.service"
// import { StempelzeitDto } from '../../../models/person';
import { ApiStempelzeit } from '../../../models-2/ApiStempelzeit';
// import { StempelzeitDto } from '../../../models/person';


@Component({
  selector: 'app-absence-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './absence-list.component.html',
  styleUrl: './absence-list.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AbsenceListComponent {

  @Output() absenceSelected = new EventEmitter<{
    id: string;
    row?: ApiStempelzeit;
    editMode?: boolean;
  }>();
selectedAbsenceId: string | number | null = null;
  displayedColumns: string[] = ['beginn', 'ende', 'actions'];
  dataSource: ApiStempelzeit[] = [];
  loading: boolean = false;
  selectedPersonId: string | null = null; // This could be set from a person selector
  totalAbsences: number = 0;

  // Delete operation state
  deleting: { [key: string]: boolean } = {};

  constructor(private absenceService: AbsenceService,
              // private abwesenheitService : AbwesenheitService,
              private abwesenheitService :DummyService
  ) {}

  ngOnInit(): void {
    //this.loadAbsences();

    this.loadAbwesenheiten();
  }

 loadAbwesenheiten(): void {
  this.abwesenheitService.getAbwesenheitsListe().subscribe((data: ApiStempelzeit[]) => {
    console.log('loadOrganisationseinheiten', data);
    // Add unique IDs to each row
    this.dataSource = data.map((item, index) => ({
      ...item,
      uniqueId: `${item.id}_${index}_${Date.now()}_${Math.random()}`
    }));
  });
}

  /*
  loadAbsences(): void {
    this.loading = true;

    this.absenceService.getAbsences(this.selectedPersonId).subscribe({
      next: (response) => {
        this.dataSource = response.data;
        this.totalAbsences = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading absences:', error);
        this.loading = false;
      },
    });
  }*/

selectAbsence(id: string, row: ApiStempelzeit): void {
  this.selectedAbsenceId = (row as any).uniqueId;
  this.absenceSelected.emit({ id, row });
}
  createAbsence(): void {
  this.selectedAbsenceId = null; // Clear selection when creating new
  this.absenceSelected.emit({ id: 'new', row: undefined });
  }

  editAbsence(id: string): void {
   // this.absenceSelected.emit({ id, editMode: true });
  }

  deleteAbsence(absence: AbsenceTableDto): void {
    if (
      confirm('Sind Sie sicher, dass Sie diese Abwesenheit löschen möchten?')
    ) {
      this.deleting[absence.id] = true;

      this.absenceService.deleteAbsence(absence.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Remove from local data
            this.dataSource = this.dataSource.filter(
              (a) => a.id !== absence.id
            );
            this.totalAbsences--;
          }
          this.deleting[absence.id] = false;
        },
        error: (error) => {
          console.error('Error deleting absence:', error);
          this.deleting[absence.id] = false;
        },
      });
    }
  }

  // Helper method to check if absence is being deleted
  isDeleting(absenceId: string): boolean {
    return !!this.deleting[absenceId];
  }
getRowDateStatus(element: ApiStempelzeit): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const beginn = element.login ? new Date(element.login) : null;
  const ende = element.logoff ? new Date(element.logoff) : null;

  // Normalize to date only
  if (beginn) beginn.setHours(0, 0, 0, 0);
  if (ende) ende.setHours(0, 0, 0, 0);

  const todayTime = today.getTime();

  // Both dates are before today → red
  if (beginn && ende && ende.getTime() < todayTime) {
    return 'row-past';
  }

  // Ende is today → current/today color
  if (ende && ende.getTime() === todayTime) {
    return 'row-today';
  }

  // Beginn is today → current/today color
  if (beginn && beginn.getTime() === todayTime) {
    return 'row-today';
  }

  return '';
}

}
