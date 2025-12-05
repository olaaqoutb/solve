import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AbsenceDetailComponent } from '../absence-detail/absence-detail.component';
import { AbsenceListComponent } from '../absence-list/absence-list.component';
import { StempelzeitDto } from '../../../models/person';


@Component({
  selector: 'app-absence',
  imports: [
    CommonModule,
    AbsenceDetailComponent,
    AbsenceListComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.scss'
})
export class AbsenceComponent {

  @ViewChild(AbsenceListComponent) absenceTable!: AbsenceListComponent;
  @ViewChild(AbsenceDetailComponent) absenceForm!: AbsenceDetailComponent;

  selectedAbsenceId: string | null = null;
  selectedAbsence: StempelzeitDto | null = null;

  constructor() {}
  ngOnInit(): void {}

  onAbsenceSelected(event: { id: string; row? : StempelzeitDto; editMode?: boolean }): void {
    this.selectedAbsenceId = event.id;
    this.selectedAbsence = event.row?? null;
    console.log(' this.selectedAbsence',  this.selectedAbsence);

    // If editMode is true, tell the form to enter edit mode
    if (event.editMode && this.absenceForm) {
      // Wait for the form to load the data, then enter edit mode
      setTimeout(() => {
        this.absenceForm.enterEditMode();
      }, 100);
    }
  }


  onFormSaved(): void {
    // Clear the selection and refresh the table
    console.log('onFormSaved',   this.selectedAbsenceId);

    this.selectedAbsenceId = null;
    if (this.absenceTable) {
      this.absenceTable.loadAbwesenheiten();
    }
  }

  onFormCancelled(): void {
    // Just clear the selection, form will stay visible
    this.selectedAbsenceId = null;
  }

}
