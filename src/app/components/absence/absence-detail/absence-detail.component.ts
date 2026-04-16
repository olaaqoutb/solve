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
// import { StempelzeitDto } from '../../../models/person';
import { DateUtilsService } from '../../../services/utils/date-utils.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog/delete-confirm-dialog.component';
// import { AbwesenheitService } from '../../../services/abwesenheit.service';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { InfoDialogComponent } from '../../dialogs/info-dialog/info-dialog.component';
import { DummyService } from '../../../services/dummy.service';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { ApiStempelzeit } from '../../../models-2/ApiStempelzeit';
import { ApiZeitTyp } from '../../../models-2/ApiZeitTyp';
import { ApiStempelzeitMarker } from '../../../models-2/ApiStempelzeitMarker';
import { ApiStempelzeitEintragungsart } from '../../../models-2/ApiStempelzeitEintragungsart';

export const GERMAN_DATE_FORMATS = {
  parse: { dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' } },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};
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
   providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: MAT_DATE_FORMATS, useValue: GERMAN_DATE_FORMATS },
  ],
  templateUrl: './absence-detail.component.html',
  styleUrl: './absence-detail.component.scss'
})


export class AbsenceDetailComponent {

  @Input() absenceId: string | null = null;
  @Input() absence: ApiStempelzeit | null = null;
  @Input() createMode: boolean = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
@Output() deleted = new EventEmitter<string>();
showForm = false;
private isSaving = false;
  absenceForm: FormGroup;
  loading = false;
  submitting = false;
  isNew = true;
  editMode = false;
  private isDeleting = false;


  constructor(private fb: FormBuilder,
              private absenceService: AbsenceService,
              // private abwesenheitService : AbwesenheitService,
                 private abwesenheitService : DummyService,
              private cd: ChangeDetectorRef,
              private dialog: MatDialog) {
    this.absenceForm = this.createForm();
  }

  ngOnInit(): void {
    this.changeEndDateAfterStartDateChange();
    if (!this.absenceId && !this.createMode) {
      this.loadAbsenceData();
    }
  }

ngOnChanges(changes: SimpleChanges): void {
  if (this.isSaving || this.isDeleting) return;  // ← add isDeleting here

  if (changes['absenceId'] || changes['createMode']) {
    this.loadAbsenceData();
  }
}
// absence-detail.component.ts
public enableCreateMode(): void {
  this.isNew = true;
  this.editMode = true;
  this.showForm = true;
  this.absenceId = null;
  this.absence = null;
  this.createMode = true;

  this.absenceForm.reset();       // reset first
  this.absenceForm.enable();      // then enable — same order as working component

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  this.absenceForm.patchValue({
    startDate: today,
    startTimeHours: 0,
    startTimeMinutes: 0,
    endDate: tomorrow,
    endTimeHours: 24,
    endTimeMinutes: 0,
    comment: '',
  });

  this.absenceForm.updateValueAndValidity();
  this.cd.detectChanges();
}
private resetForm(): void {
  // Use setValue instead of reset to avoid resetting disabled states
  this.absenceForm.patchValue(
    {
      startDate: '',
      startTimeHours: 0,
      startTimeMinutes: 0,
      endDate: '',
      endTimeHours: 0,
      endTimeMinutes: 0,
      comment: '',
    },
    { emitEvent: false }
  );
  // Clear errors manually
  Object.keys(this.absenceForm.controls).forEach(key => {
    this.absenceForm.get(key)?.setErrors(null);
    this.absenceForm.get(key)?.markAsPristine();
    this.absenceForm.get(key)?.markAsUntouched();
  });
}

private createForm(): FormGroup {
  return this.fb.group(
    {
      startDate: ['', Validators.required],
      startTimeHours: [0, [Validators.min(0), Validators.max(24)]],
      startTimeMinutes: [0, [Validators.min(0), Validators.max(59)]],
      endDate: ['', Validators.required],
      endTimeHours: [0, [Validators.min(0), Validators.max(24)]],
      endTimeMinutes: [0, [Validators.min(0), Validators.max(59)]],
      comment: ['', [Validators.maxLength(60)]],
    },
    { validators: this.dateRangeValidator.bind(this) }
  );
}

dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDateVal = control.get('startDate')?.value;
  const endDateVal = control.get('endDate')?.value;

  if (!startDateVal || !endDateVal) return null;

  const startH = Number(control.get('startTimeHours')?.value) || 0;
  const startM = Number(control.get('startTimeMinutes')?.value) || 0;
  const endH = Number(control.get('endTimeHours')?.value) || 0;
  const endM = Number(control.get('endTimeMinutes')?.value) || 0;

  const start = new Date(startDateVal);
  start.setHours(startH, startM, 0, 0);

  const end = new Date(endDateVal);
  end.setHours(endH, endM, 0, 0);

  if (end <= start) {
    return { startDateAfterEndDate: true };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const startDateOnly = new Date(startDateVal);
  startDateOnly.setHours(0, 0, 0, 0);

  if (startDateOnly < todayStart) {
    return { startDateInPast: true };
  }

  const endDateOnly = new Date(endDateVal);
  endDateOnly.setHours(0, 0, 0, 0);

  if (endDateOnly < todayStart) {
    return { endDateInPast: true };
  }

  const now = new Date();
  if (endDateOnly.getTime() === todayStart.getTime()) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (endH < currentHour || (endH === currentHour && endM <= currentMinute)) {
      return { endTimeInPast: true };
    }
  }

  return null;
}
changeEndDateAfterStartDateChange() {
  this.absenceForm.get('startDate')?.valueChanges.subscribe((selectedDate) => {
    if (!selectedDate) return;

    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDateControl = this.absenceForm.get('endDate');
    const endDateValue = endDateControl?.value;

    if (endDateValue) {
      const endDate = new Date(endDateValue);
      endDate.setHours(0, 0, 0, 0);

      if (startDate > endDate) {
        endDateControl?.patchValue(new Date(selectedDate), { emitEvent: false });
      }
    }
  });
}


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
  if (!this.absenceId && !this.createMode) {
    this.showForm = false;
    this.isNew = false;
    this.editMode = false;
    this.absenceForm.reset();
    this.disableForm();
    this.cd.detectChanges();  // ← add this
    return;
  }

  this.isNew = this.absenceId === 'new' || !this.absenceId;
  this.editMode = this.isNew;

  if (this.createMode || this.absenceId === 'new') {
    this.isNew = true;
    this.editMode = true;
    this.showForm = true;        // ← add this, was missing here
    this.enableForm();           // ← must come BEFORE patchValue
    this.resetForm();            // ← reset AFTER enable, so controls aren't disabled when reset
    this.absenceForm.enable();   // ← call again explicitly after reset (reset can re-disable)

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.absenceForm.patchValue({
      startDate: today,
      startTimeHours: 0,
      startTimeMinutes: 0,
      endDate: tomorrow,
      endTimeHours: 24,
      endTimeMinutes: 0,
    });

    this.absenceForm.updateValueAndValidity();
    this.cd.detectChanges();  // ← force template to see enabled state
    return;
  }

  if (this.absenceId && this.absenceId !== 'new') {
    this.isNew = false;
    this.editMode = false;
    this.loading = true;
    this.absenceForm.enable({ emitEvent: false });

    this.absenceForm.patchValue({
      startDate: this.absence?.login || '',
      startTimeHours: DateUtilsService.getHours(this.absence?.login),
      startTimeMinutes: DateUtilsService.getMinutes(this.absence?.login),
      endDate: this.absence?.logoff || '',
      endTimeHours: DateUtilsService.getHours(this.absence?.logoff),
      endTimeMinutes: DateUtilsService.getMinutes(this.absence?.logoff),
      comment: this.absence?.anmerkung || '',
    }, { emitEvent: false });

    this.absenceForm.updateValueAndValidity();
    this.disableForm();
    this.loading = false;
    this.cd.detectChanges();  // ← add this
  }
}

onSubmit(): void {
  Object.keys(this.absenceForm.controls).forEach((key) => {
    this.absenceForm.get(key)?.markAsTouched();
  });

  const formValues = this.absenceForm.getRawValue();

 if (!formValues.startDate || isNaN(new Date(formValues.startDate).getTime())) {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Pflichtfelder fehlen',
        detail: !formValues.startDate
          ? 'Bitte wählen Sie ein Startdatum aus.'
          : 'Bitte wählen Sie ein Enddatum aus.'
      },
      panelClass: 'custom-dialog-width'
    });
    return;
  }

 if (this.absenceForm.invalid) {
  if (this.absenceForm.hasError('startDateAfterEndDate')) {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Ungültige Eingabe',
        detail: 'Das Enddatum und die Endzeit müssen nach dem Startdatum und der Startzeit liegen.'
      },
      panelClass: 'custom-dialog-width'
    });
  } else if (this.absenceForm.hasError('startDateInPast')) {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Ungültige Eingabe',
        detail: 'Das Startdatum darf nicht in der Vergangenheit liegen.'
      },
      panelClass: 'custom-dialog-width'
    });
  } else if (this.absenceForm.hasError('endDateInPast')) {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Ungültige Eingabe',
        detail: 'Das Enddatum darf nicht in der Vergangenheit liegen.'
      },
      panelClass: 'custom-dialog-width'
    });
  } else if (this.absenceForm.hasError('endTimeInPast')) {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Ungültige Eingabe',
        detail: 'Die Endzeit darf nicht in der Vergangenheit liegen. Bitte wählen Sie eine Endzeit nach der aktuellen Uhrzeit.'
      },
      panelClass: 'custom-dialog-width'
    });
  } else {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Ungültige Eingabe',
        detail: 'Bitte überprüfen Sie Ihre Eingaben.'
      },
      panelClass: 'custom-dialog-width'
    });
  }
  return;
}

  this.submitting = true;

  const startTimeFormatted = `${this.padZero(formValues.startTimeHours)}:${this.padZero(formValues.startTimeMinutes)}`;
  const endTimeFormatted = `${this.padZero(formValues.endTimeHours)}:${this.padZero(formValues.endTimeMinutes)}`;

  if (this.isNew) {
    const updatedAbsence1: ApiStempelzeit = {
      zeitTyp: ApiZeitTyp.ABWESENHEIT,
      login: DateUtilsService.formatDateAndTimeToISOFull(
        new Date(this.absenceForm.get('startDate')?.value),
        startTimeFormatted
      ),
      logoff: DateUtilsService.formatDateAndTimeToISOFull(
        new Date(this.absenceForm.get('endDate')?.value),
        endTimeFormatted
      ),
      anmerkung: formValues.comment,
      loginSystem: '',
      logoffSystem: '',
      poKorrektur: true,
      marker: ApiStempelzeitMarker.TEMP_ABWESENHEIT,
      eintragungsart: ApiStempelzeitEintragungsart.NORMAL,
      version: this.absence?.version
    };

    this.abwesenheitService.createAbwesenheit(updatedAbsence1).subscribe({
    next: (response) => {
  this.isSaving = true;

  this.submitting = false;
  this.createMode = false;
  this.isNew = false;
  this.editMode = false;
  this.showForm = true;
  this.absenceId = response.body?.id ?? this.absenceId;
  this.absence = response.body ?? this.absence;
  this.disableForm();
this.cd.detectChanges();
  this.dialog.open(InfoDialogComponent, {
    data: {
      title: 'Erfolgreich erstellt',
      detail: 'Die Abwesenheit wurde erfolgreich erstellt!'
    },
    panelClass: 'custom-dialog-width'
  });

  this.saved.emit();

  // Reset guard after Angular's change detection cycle
  setTimeout(() => { this.isSaving = false; }, 0);
},
      error: (err) => {
        console.error('Error occurred during save:', err);
        console.error('Error-Headers:', err.headers);
        console.error('Error:', err.error);

        if (err.status === 400) {
          console.warn('Bad request - validation failed');
        }

        this.dialog.open(ErrorDialogComponent, {
          data: {
            title: 'Fehler beim Speichern',
            detail: err.error
          },
          panelClass: 'custom-dialog-width'
        });

        this.submitting = false;
      }
    });

  } else {

    const updatedAbsence1: ApiStempelzeit = {
      id: this.absenceId!,
      zeitTyp: ApiZeitTyp.ABWESENHEIT,
      login: DateUtilsService.formatDateAndTimeToISOFull(
        new Date(this.absenceForm.get('startDate')?.value),
        startTimeFormatted
      ),
      logoff: DateUtilsService.formatDateAndTimeToISOFull(
        new Date(this.absenceForm.get('endDate')?.value),
        endTimeFormatted
      ),
      anmerkung: formValues.comment,
      loginSystem: '',
      logoffSystem: '',
      poKorrektur: true,
      marker: ApiStempelzeitMarker.TEMP_ABWESENHEIT,
      eintragungsart: ApiStempelzeitEintragungsart.NORMAL,
      version: this.absence?.version
    };

    this.abwesenheitService.editAbwesenheit(updatedAbsence1).subscribe({
    next: (response) => {
  this.isSaving = true;

  this.submitting = false;
  this.editMode = false;
  this.isNew = false;
  this.showForm = true; // ← ADD THIS - was missing for edit case
  this.absence = response.body ?? this.absence;
  this.disableForm();
this.cd.detectChanges();
  this.dialog.open(InfoDialogComponent, {
    data: {
      title: 'Erfolgreich gespeichert',
      detail: 'Die Abwesenheit wurde erfolgreich gespeichert!'
    },
    panelClass: 'custom-dialog-width'
  });

  this.saved.emit();
  setTimeout(() => { this.isSaving = false; }, 0);
},
      error: (err) => {
        console.error('Error occurred during save:', err);
        console.error('Error-Headers:', err.headers);
        console.error('Error:', err.error);

        if (err.status === 400) {
          console.warn('Bad request - validation failed');
        }

        this.dialog.open(ErrorDialogComponent, {
          data: {
            title: 'Fehler beim Speichern',
            detail: err.error
          },
          panelClass: 'custom-dialog-width'
        });

        this.submitting = false;
      }
    });
  }
}
  onCancel(): void {
   if (this.editMode && !this.isNew) {
    this.exitEditMode();
  } else {
    // ← Reset and hide form instead of just emitting
    this.createMode = false;
    this.isNew = true;
    this.showForm = false;
    this.absenceForm.reset();
    this.cancelled.emit();
    }
  }

  onDelete(absence : ApiStempelzeit) : void {
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


// absence-detail.component.ts
delete(row: ApiStempelzeit) {
  row.deleted = true;
  this.isDeleting = true;  // ← set before async call
  this.abwesenheitService.deleteAbwesenheit(row).subscribe(() => {
    this.showForm = false;
    this.absence = null;
    this.absenceId = null;
    this.createMode = false;
    this.isNew = false;
    this.editMode = false;
    this.absenceForm.reset();
    this.deleted.emit(row.id!);
    setTimeout(() => { this.isDeleting = false; }, 0);  // ← reset after cycle
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

enterEditMode(): void {
  const currentValues = this.absenceForm.getRawValue();
  this.editMode = true;
  this.isNew = false;

  this.absenceForm.enable();

  this.absenceForm.clearValidators();
  this.absenceForm.setValidators(this.dateRangeValidator.bind(this));

  this.absenceForm.patchValue(currentValues, { emitEvent: false });
  this.absenceForm.updateValueAndValidity();
}
exitEditMode(): void {
  this.editMode = false;
  this.isNew = false;

  // Repopulate form with saved absence data
  if (this.absence) {
    this.absenceForm.enable({ emitEvent: false });
    this.absenceForm.patchValue({
      startDate: this.absence.login || '',
      startTimeHours: DateUtilsService.getHours(this.absence.login),
      startTimeMinutes: DateUtilsService.getMinutes(this.absence.login),
      endDate: this.absence.logoff || '',
      endTimeHours: DateUtilsService.getHours(this.absence.logoff),
      endTimeMinutes: DateUtilsService.getMinutes(this.absence.logoff),
      comment: this.absence.anmerkung || '',
    }, { emitEvent: false });
  }

  this.absenceForm.clearValidators();
  this.absenceForm.setValidators(this.dateRangeValidator.bind(this));
  this.absenceForm.updateValueAndValidity();
  this.disableForm();
  this.cd.detectChanges(); // ← force UI update
}

  private enableForm(): void {
    this.absenceForm.enable();
  }

  private disableForm(): void {
    this.absenceForm.disable();
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
  private isDragging = false;
  private dragStartY = 0;
  private dragStartValue = 0;
  private activeDragField = '';

  onDragStart(event: MouseEvent, fieldName: string): void {
    event.preventDefault();
    this.isDragging = true;
    this.activeDragField = fieldName;
    this.dragStartY = event.clientY;

    const control = this.absenceForm.get(fieldName);
    this.dragStartValue = control?.value || 0;
    document.body.style.cursor = 'ns-resize';

    document.addEventListener('mousemove', this.onDragMove.bind(this));
    document.addEventListener('mouseup', this.onDragEnd.bind(this));
  }

  onDragMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    event.preventDefault();

    const deltaY = this.dragStartY - event.clientY;

    const sensitivity = 5;
    const change = Math.floor(deltaY / sensitivity);

    let newValue = this.dragStartValue + change;

    let minValue = 0;
    let maxValue = this.activeDragField.includes('Hours') ? 23 : 59;

    newValue = Math.max(minValue, Math.min(maxValue, newValue));
    const control = this.absenceForm.get(this.activeDragField);
    if (control) {
      control.setValue(newValue);
    }
  }

  onDragEnd(event: MouseEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.activeDragField = '';

    document.body.style.cursor = '';

    document.removeEventListener('mousemove', this.onDragMove.bind(this));
    document.removeEventListener('mouseup', this.onDragEnd.bind(this));
  }

  // formatTimeValue(value: number): string {
  //   return value < 10 ? `0${value}` : `${value}`;
  // }
adjustTime(field: string, direction: 1 | -1, max: number): void {
  const control = this.absenceForm.get(field);
  if (!control) return;

  const current = control.value !== null && control.value !== undefined
    ? Number(control.value)
    : 0;
  const currentNum = isNaN(current) ? 0 : current;

  let newVal = currentNum + direction;

  // Wrap around instead of clamping
  if (newVal < 0) newVal = max;
  if (newVal > max) newVal = 0;

  control.patchValue(newVal, { emitEvent: true });
  control.markAsTouched();

  // When hours hit 24, reset minutes to 0 but DON'T disable
  if (field === 'startTimeHours' || field === 'endTimeHours') {
    const minutesField = field === 'startTimeHours'
      ? 'startTimeMinutes'
      : 'endTimeMinutes';
    const minutesControl = this.absenceForm.get(minutesField);
    if (minutesControl && newVal === 24 && minutesControl.value !== 0) {
      minutesControl.patchValue(0, { emitEvent: false });
    }
    // Remove the disable/enable logic entirely
  }

  this.absenceForm.updateValueAndValidity();
}
onTimeInput(field: string, event: Event, max: number): void {
  const input = event.target as HTMLInputElement;

  // Strip non-numeric characters
  input.value = input.value.replace(/[^0-9]/g, '');

  if (input.value === '') {
    this.absenceForm.get(field)?.patchValue(0, { emitEvent: true });
    return;
  }

  let num = parseInt(input.value, 10);

  // Take only last digit(s) if exceeds max
  if (num > max) {
    const str = input.value;
    const lastDigit = parseInt(str[str.length - 1], 10);
    num = lastDigit;
    input.value = String(num);
  }

  this.absenceForm.get(field)?.patchValue(num, { emitEvent: true });
  this.absenceForm.updateValueAndValidity();
}
}
