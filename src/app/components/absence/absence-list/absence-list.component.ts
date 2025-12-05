import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AbsenceService } from '../../../services/absence.service';
import { AbsenceTableDto } from '../../../models/absence.interface';
import { AbwesenheitService } from '../../../services/abwesenheit.service';
import { StempelzeitDto } from '../../../models/person';
 

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
  styleUrl: './absence-list.component.scss'
})
export class AbsenceListComponent {

  @Output() absenceSelected = new EventEmitter<{
    id: string;
    row?: StempelzeitDto;
    editMode?: boolean;
  }>();

  displayedColumns: string[] = ['beginn', 'ende', 'actions'];
  dataSource: StempelzeitDto[] = [];
  loading: boolean = false;
  selectedPersonId: string | null = null; // This could be set from a person selector
  totalAbsences: number = 0;

  // Delete operation state
  deleting: { [key: string]: boolean } = {};
  
  constructor(private absenceService: AbsenceService,
              private abwesenheitService : AbwesenheitService
  ) {}

  ngOnInit(): void {
    //this.loadAbsences();

    this.loadAbwesenheiten();
  }

  loadAbwesenheiten(): void {
    this.abwesenheitService.getAbwesenheitsListe().subscribe((data: StempelzeitDto[]) => {
        console.log('loadOrganisationseinheiten', data);
        this.dataSource  = data;
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

  selectAbsence( id: string, row : StempelzeitDto): void {
    console.log('selectAbsence-row',  row);
    console.log('selectAbsence-ID',  id);
    this.absenceSelected.emit({ id, row });
  }
  createAbsence(): void {
    this.absenceSelected.emit({ id: 'new', row : undefined });
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

}
