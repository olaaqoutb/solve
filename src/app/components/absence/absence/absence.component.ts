import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AbsenceDetailComponent } from '../absence-detail/absence-detail.component';
import { AbsenceListComponent } from '../absence-list/absence-list.component';
// import { StempelzeitDto } from '../../../models/person';
import { ApiStempelzeit } from '../../../models-2/ApiStempelzeit';


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
  selectedAbsence: ApiStempelzeit | null = null;
  private isEditing: boolean = false;

  constructor() {}
  ngOnInit(): void {}

  // Check if form is active (edit mode or create mode)
  isFormActive(): boolean {
    return (this.selectedAbsenceId === 'new') || this.isEditing;
  }

  // Check if form is in edit mode (not create mode)
  isFormInEditMode(): boolean {
    return this.isEditing && this.selectedAbsenceId !== 'new';
  }

  // Check if form is invalid
  isFormInvalid(): boolean {
    return this.absenceForm?.absenceForm?.invalid ?? true;
  }

  onAbsenceSelected(event: { id: string; row? : ApiStempelzeit; editMode?: boolean }): void {
    this.selectedAbsenceId = event.id;
    this.selectedAbsence = event.row ?? null;
    this.isEditing = false;

    console.log('Selected absence:', this.selectedAbsence);
  }

  createNewAbsence(): void {
    this.selectedAbsenceId = 'new';
    this.selectedAbsence = null;
    this.isEditing = true;
  }

  enterEditMode(): void {
    this.isEditing = true;
    if (this.absenceForm) {
      this.absenceForm.enterEditMode();
    }
  }

  // cancelForm(): void {
  //   if (this.selectedAbsenceId === 'new') {
  //     // If creating new, just clear selection
  //     this.selectedAbsenceId = null;
  //     this.selectedAbsence = null;
  //   }
  //   this.isEditing = false;

  //   if (this.absenceForm) {
  //     this.absenceForm.exitEditMode();
  //   }
  // }

  // saveForm(): void {
  //   if (this.absenceForm && !this.isFormInvalid()) {
  //     this.absenceForm.onSubmit();
  //   }
  // }

  // deleteAbsence(): void {
  //   if (this.selectedAbsence && this.absenceForm) {
  //     this.absenceForm.onDelete(this.selectedAbsence);
  //   }
  // }

  onFormSaved(): void {
    console.log('Form saved successfully');
    this.selectedAbsenceId = null;
    this.selectedAbsence = null;
    this.isEditing = false;

    if (this.absenceTable) {
      this.absenceTable.loadAbwesenheiten();
    }
  }

  onFormCancelled(): void {
    console.log('Form cancelled');
    this.selectedAbsenceId = null;
    this.selectedAbsence = null;
    this.isEditing = false;
  }
}
