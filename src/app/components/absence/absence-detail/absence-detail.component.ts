import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  CreateAbsenceRequest,
  UpdateAbsenceRequest,
} from '../../../models/absence.interface';
import { AbsenceService } from '../../../services/absence.service';
import { StempelzeitDto } from '../../../models/person';
import { DateUtilsService } from '../../../services/utils/date-utils.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog/delete-confirm-dialog.component';
import { AbwesenheitService } from '../../../services/abwesenheit.service';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { InfoDialogComponent } from '../../dialogs/info-dialog/info-dialog.component';

@Component({
  selector: 'app-absence-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  templateUrl: './absence-detail.component.html',
  styleUrl: './absence-detail.component.scss'
})


export class AbsenceDetailComponent {

  @Input() absenceId: string | null = null;
  @Input() absence: StempelzeitDto | null = null;
  @Input() createMode: boolean = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();


  absenceForm: FormGroup;
  loading = false;
  submitting = false;
  isNew = true;
  editMode = false; // Add editMode property

  constructor(private fb: FormBuilder, 
              private absenceService: AbsenceService,
              private abwesenheitService : AbwesenheitService,
              private cd: ChangeDetectorRef,
              private dialog: MatDialog) {
    this.absenceForm = this.createForm();
  }

  ngOnInit(): void {
    this.changeEndDateAfterStartDateChange();

    this.loadAbsenceData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['absenceId'] || changes['createMode']) {
      this.loadAbsenceData();
    }
  }

  changeEndDateAfterStartDateChange(){
    this.absenceForm.get('startDate')?.valueChanges.subscribe((selectedDate) => {
      if (!selectedDate) return;

      const startDate = new Date(selectedDate);
      const endDateControl = this.absenceForm.get('endDate');
      const endDateValue = endDateControl?.value;

      // Only update endDate if startDate is after endDate
      if (endDateValue) {
        const endDate = new Date(endDateValue);

        if (startDate > endDate) {
          endDateControl?.patchValue(startDate, { emitEvent: false });
          this.cd.markForCheck(); // For OnPush change detection
        }
      } else {
        // Optionally set endDate to startDate if it's empty
        this.absenceForm.patchValue({ endDate: startDate }, { emitEvent: false });
      }
    });
  }


  enableCreateMode(): void {
    this.createMode = true;
    this.isNew = true;
    this.resetForm();

    // Set default values
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.absenceForm.patchValue({
      startDate: today,
      startTimeHours: 9,
      startTimeMinutes: 0,
      endDate: tomorrow,
      endTimeHours: 17,
      endTimeMinutes: 0,
    });
  }

  private resetForm(): void {
    // Reset the form without emitting value changes events
    this.absenceForm.reset(
      {
        startDate: '',
        startTimeHours: '',
        startTimeMinutes: '',
        endDate: '',
        endTimeHours: '',
        endTimeMinutes: '',
        comment: '',
      },
      { emitEvent: false }
    );
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        startDate: ['', Validators.required],
        startTimeHours: [
          '',
          [Validators.required, Validators.min(0), Validators.max(23)],
        ],
        startTimeMinutes: [
          '',
          [Validators.required, Validators.min(0), Validators.max(59)],
        ],

        endDate: ['', Validators.required],
        endTimeHours: [
          '',
          [Validators.required, Validators.min(0), Validators.max(23)],
        ],
        endTimeMinutes: [
          '',
          [Validators.required, Validators.min(0), Validators.max(59)],
        ],
        comment: [''],
      },
      { validators: this.dateRangeValidator 

      }
    );
  }

  // Custom validator
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (!startDate || !endDate) return null; // Don't validate if empty

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Ensure dates are in the future
    if (start < now || end < now) {
      return { dateInPast: true };
    }

    // Ensure start < end
    if (start > end) {
      return { startDateAfterEndDate: true };
    }

    return null; // Valid
  }


  // Helper to check validation errors
  getErrorText(field: string): string {
    const control = this.absenceForm.get(field);
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) {
        return `${field === 'startDate' ? 'Startdatum' : 'Enddatum'} ist erforderlich`;
      }
    }
    return '';
  }

  private loadAbsenceData(): void {
    this.isNew = this.absenceId === 'new' || !this.absenceId;
    this.editMode = this.isNew; // Auto-enable edit mode for new absences

    // If we're in create mode or the ID is 'new', set up for a new absence
    if (this.createMode || this.absenceId === 'new') {
      this.isNew = true;
      this.editMode = true;
      this.resetForm();
      this.enableForm(); // Enable form for new absences

      // Set default values for new absence
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      this.absenceForm.patchValue({
        startDate: today,
        startTimeHours: 9,
        startTimeMinutes: 0,
        endDate: tomorrow,
        endTimeHours: 17,
        endTimeMinutes: 0,
      });
      return;
    } // If we have an ID and it's not 'new', load the absence data
    if (this.absenceId && this.absenceId !== 'new') {
      console.log('absenceId', this.absenceId);

      this.editMode = false; // Start in view mode for existing absences
      this.loading = true;


     // this.selectedRow.login =  DateUtilsService.formatDateToISOFull( new Date(this.selectedRow.login));
     // this.selectedRow.logoff =  DateUtilsService.formatDateToISOFull( new Date(this.selectedRow.logoff));
      
      console.log('this.absence?.login', this.absence?.login);
      console.log('DateUtilsService.getMinutes(this.absence?.login)', DateUtilsService.getMinutes(this.absence?.login));
      console.log('DateUtilsService.getHours(this.absence?.login)', DateUtilsService.getHours(this.absence?.login));
     //DateUtilsService.formatDateToISOFull( new Date(this.absence && this.absence.login ? new Date(this.absence.login)))
      this.absenceForm.patchValue({
        
   /*    startDate: DateUtilsService.formatDateToISOFull( new Date(this.absence.login)),
        startTimeHours: parseInt(startTimeParts[0], 10),
        startTimeMinutes: parseInt(startTimeParts[1], 10),
        endDate: absence.endDate,
        endTimeHours: parseInt(endTimeParts[0], 10),
        endTimeMinutes: parseInt(endTimeParts[1], 10),
        */
    //   startDate : (this.absence && this.absence.login ? DateUtilsService.formatDateToISOFull(new Date(this.absence.login)) : '') ,
        startDate : this.absence?.login || '' ,
       
        startTimeHours : DateUtilsService.getHours(this.absence?.login),
        startTimeMinutes : DateUtilsService.getMinutes(this.absence?.login),

        endDate : this.absence?.logoff || '',
        endTimeHours : DateUtilsService.getHours(this.absence?.logoff),
        endTimeMinutes : DateUtilsService.getMinutes(this.absence?.logoff),

        comment: this.absence?.anmerkung || '',
      });

      this.loading = false;

      /*
      this.absenceService.getAbsence(this.absenceId).subscribe({
        next: (response) => {
          if (response.success) {
            const absence = response.data;

            // Parse time values
            const startTimeParts = absence.startTime.split(':');
            const endTimeParts = absence.endTime.split(':');

            this.absenceForm.patchValue({
              startDate: absence.startDate,
              startTimeHours: parseInt(startTimeParts[0], 10),
              startTimeMinutes: parseInt(startTimeParts[1], 10),
              endDate: absence.endDate,
              endTimeHours: parseInt(endTimeParts[0], 10),
              endTimeMinutes: parseInt(endTimeParts[1], 10),
              comment: absence.comment || '',
            });

            // Disable form for view mode
            this.disableForm();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading absence:', error);
          this.loading = false;
        },
      });

      */
    }
  }

  onSubmit(): void {
    if (this.absenceForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.absenceForm.controls).forEach((key) => {
        const control = this.absenceForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formValues = this.absenceForm.value;

    // Format time values
    const startTimeFormatted = `${this.padZero(
      formValues.startTimeHours
    )}:${this.padZero(formValues.startTimeMinutes)}`;
    const endTimeFormatted = `${this.padZero(
      formValues.endTimeHours
    )}:${this.padZero(formValues.endTimeMinutes)}`;

    // Use current user's person ID (in a real app, this would come from authentication)
    const personId = 'person-1'; // Hassan Terab's ID

    if (this.isNew) {
      const newAbsence: CreateAbsenceRequest = {
        personId,
        startDate: formValues.startDate,
        startTime: startTimeFormatted,
        endDate: formValues.endDate,
        endTime: endTimeFormatted,
        comment: formValues.comment,
      };

      const updatedAbsence1: StempelzeitDto = {
      //  id: this.absenceId!,
        zeitTyp: 'ABWESENHEIT',
        login: DateUtilsService.formatDateAndTimeToISOFull(new Date(this.absenceForm.get('startDate')?.value), startTimeFormatted),
        logoff: DateUtilsService.formatDateAndTimeToISOFull(new Date(this.absenceForm.get('endDate')?.value), endTimeFormatted),
         anmerkung: formValues.comment,
         loginSystem: '',
         logoffSystem: '',
         poKorrektur: true,
         marker: ['TEMP_ABWESENHEIT'],
         eintragungsart: 'NORMAL',
        // version : this.absence?.version
      };

/*
      this.abwesenheitService.createAbwesenheit(updatedAbsence1).subscribe((data: StempelzeitDto[]) => {
        this.saved.emit();
        this.submitting = false;

     //   this.dataSource.data.push(this.selectedRow as StempelzeitDto)
      //  this.dataSource._updateChangeSubscription();
      });
*/

      this.abwesenheitService.createAbwesenheit(updatedAbsence1).subscribe({
        next: (response) => {
          console.log('Full HTTP Response:', response);
      
          // Access the body
          const data = response.body;
          console.log('Response Body:', data);
      
          // Access status code
          console.log('Status Code:', response.status);
      
          // Access headers
          console.log('Headers:', response.headers);
      

          this.dialog.open(InfoDialogComponent, {
            data: {
              title: 'erfolgreich erstellt',
               detail: 'Die Abewesenheit wurde erfolgreich erstellt!' 
            },
             panelClass: 'custom-dialog-width',
           });
      

          this.saved.emit();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Error occurred during save:', err);
          console.error('Error-Headers:', err.headers);
          console.error('Error:', err.error);

          // Handle specific HTTP errors if needed
          if (err.status === 400) {
            console.warn('Bad request - validation failed');
          }


          this.dialog.open(ErrorDialogComponent, {
            data: {
              title: 'Fehler beim Speichern',
          //    message: 'TEST1 - ' +   err.error || 'Ein unbekannter Fehler ist aufgetreten.',
              detail: err.error //|| JSON.stringify(err)
            },
             panelClass: 'custom-dialog-width',
             //width: '600px'
          });
      
          this.submitting = false;
        }
      });


      /*
      this.absenceService.createAbsence(newAbsence).subscribe({
        next: (response) => {
          if (response.success) {
            this.saved.emit();
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating absence:', error);
          this.submitting = false;
        },
      });
      */
    } else {

      console.log('absenceForm', this.absenceForm);
       console.log('startDate',this.absenceForm.get('startDate')?.value);
       console.log('Hours', startTimeFormatted);
       console.log('Miutes', startTimeFormatted);

       DateUtilsService.formatDateAndTimeToISOFull(new Date(this.absenceForm.get('startDate')?.value), startTimeFormatted);
       console.log('endDate',this.absenceForm.get('endDate')?.value);
       console.log('Hours', endTimeFormatted);
       console.log('Miutes', endTimeFormatted);

      console.log('comment',this.absenceForm.get('comment')?.value);
     
      DateUtilsService.formatDateAndTimeToISOFull(new Date(this.absenceForm.get('endDate')?.value), endTimeFormatted);
 
       const updatedAbsence1: StempelzeitDto = {
        id: this.absenceId!,
        zeitTyp: 'ABWESENHEIT',
        login: DateUtilsService.formatDateAndTimeToISOFull(new Date(this.absenceForm.get('startDate')?.value), startTimeFormatted),
        logoff: DateUtilsService.formatDateAndTimeToISOFull(new Date(this.absenceForm.get('endDate')?.value), endTimeFormatted),
         anmerkung: formValues.comment,
         loginSystem: '',
         logoffSystem: '',
         poKorrektur: true,
         marker: ['TEMP_ABWESENHEIT'],
         eintragungsart: 'NORMAL',
         version : this.absence?.version
      };


      this.abwesenheitService.editAbwesenheit(updatedAbsence1).subscribe({
        next: (response) => {
          console.log('Full HTTP Response:', response);
      
          // Access the body
          const data = response.body;
          console.log('Response Body:', data);
      
          // Access status code
          console.log('Status Code:', response.status);
      
          // Access headers
          console.log('Headers:', response.headers);
      
          this.dialog.open(InfoDialogComponent, {
            data: {
              title: 'Erfolgreich gespeichert',
               detail: 'Die Abewesenheit wurde erfolgreich gespichert' 
            },
             panelClass: 'custom-dialog-width',
           });
      
           
          this.saved.emit();
          this.submitting = false;
        },
        error: (err) => {
      

          console.error('Error occurred during save:', err);
          console.error('Error-Headers:', err.headers);
          console.error('Error:', err.error);

          // Handle specific HTTP errors if needed
          if (err.status === 400) {
            console.warn('Bad request - validation failed');
          }


          this.dialog.open(ErrorDialogComponent, {
            data: {
              title: 'Fehler beim Speichern',
               detail: err.error  
            },
             panelClass: 'custom-dialog-width',
           });
      
          this.submitting = false;
        }
        
      });

      /*
      this.abwesenheitService.editAbwesenheit(updatedAbsence1).subscribe((data: StempelzeitDto[]) => {

        console.log('Saved-data', data);
        this.saved.emit();
        this.submitting = false;
      });
 */
      /*
      const updatedAbsence: UpdateAbsenceRequest = {
        id: this.absenceId!,
        personId,
        startDate: formValues.startDate,
        startTime: startTimeFormatted,
        endDate: formValues.endDate,
        endTime: endTimeFormatted,
        comment: formValues.comment,
      };

      this.absenceService.updateAbsence(updatedAbsence).subscribe({
        next: (response) => {
          if (response.success) {
            this.saved.emit();
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error updating absence:', error);
          this.submitting = false;
        },
      });
      */
    }
  }
  onCancel(): void {
    if (this.editMode && !this.isNew) {
      // If in edit mode for existing absence, exit edit mode
      this.exitEditMode();
    } else {
      // If creating new or in view mode, emit cancelled event
      this.cancelled.emit();
    }
  }

  onDelete(absence : StempelzeitDto) : void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '500px',
      data: { absence }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('RESULT IS NOT NULL', absence);
        this.delete(absence);
      }else{
        console.log('RESULT IS NULL');
      }
    });

  }

  
  delete(row: StempelzeitDto) {
   
    console.log('selected-row', row);
    row.deleted= true;
    this.abwesenheitService.deleteAbwesenheit(row).subscribe((data: StempelzeitDto[]) => {
      this.saved.emit();
  /*    this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription();
      this.selectedRow = undefined;
      this.action = 'noAction'
    */
    });
  }


  onDelete_(): void {
    if (
      !this.isNew &&
      confirm('Möchten Sie diese Abwesenheit wirklich löschen?')
    ) {
      this.absenceService.deleteAbsence(this.absenceId!).subscribe({
        next: (response) => {
          if (response.success) {
            this.saved.emit();
          }
        },
        error: (error) => {
          console.error('Error deleting absence:', error);
        },
      });
    }
  }
  /**
   * Enter edit mode for the current absence
   */
  enterEditMode(): void {
    this.editMode = true;
    this.enableForm();
  }

  /**
   * Exit edit mode and return to view mode
   */
  exitEditMode(): void {
    this.editMode = false;
    this.disableForm();
  }

  /**
   * Enable all form controls
   */
  private enableForm(): void {
    this.absenceForm.enable();
  }

  /**
   * Disable all form controls
   */
  private disableForm(): void {
    this.absenceForm.disable();
  }

  // Helper method to pad single-digit numbers with a leading zero
  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
  // Drag-based scrubber input variables
  private isDragging = false;
  private dragStartY = 0;
  private dragStartValue = 0;
  private activeDragField = '';

  // Drag scrubber methods for time inputs
  onDragStart(event: MouseEvent, fieldName: string): void {
    event.preventDefault();
    this.isDragging = true;
    this.activeDragField = fieldName;
    this.dragStartY = event.clientY;

    const control = this.absenceForm.get(fieldName);
    this.dragStartValue = control?.value || 0;

    // Change cursor to indicate dragging
    document.body.style.cursor = 'ns-resize';

    // Add global event listeners
    document.addEventListener('mousemove', this.onDragMove.bind(this));
    document.addEventListener('mouseup', this.onDragEnd.bind(this));
  }

  onDragMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    event.preventDefault();

    // Calculate drag distance (negative = up, positive = down)
    const deltaY = this.dragStartY - event.clientY;

    // Sensitivity: every 5 pixels = 1 unit change
    const sensitivity = 5;
    const change = Math.floor(deltaY / sensitivity);

    let newValue = this.dragStartValue + change;

    // Get min/max values based on field type
    let minValue = 0;
    let maxValue = this.activeDragField.includes('Hours') ? 23 : 59;

    // Clamp value within bounds
    newValue = Math.max(minValue, Math.min(maxValue, newValue));

    // Update the form control
    const control = this.absenceForm.get(this.activeDragField);
    if (control) {
      control.setValue(newValue);
    }
  }

  onDragEnd(event: MouseEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.activeDragField = '';

    // Reset cursor
    document.body.style.cursor = '';

    // Remove global event listeners
    document.removeEventListener('mousemove', this.onDragMove.bind(this));
    document.removeEventListener('mouseup', this.onDragEnd.bind(this));
  }

  // Format display value with leading zero
  formatTimeValue(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
}
