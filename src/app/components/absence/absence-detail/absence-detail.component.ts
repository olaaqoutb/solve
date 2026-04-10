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


  absenceForm: FormGroup;
  loading = false;
  submitting = false;
  isNew = true;
  editMode = false; // Add editMode property

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
    if (changes['absenceId'] || changes['createMode']) {
      this.loadAbsenceData();
    }
  }

  // changeEndDateAfterStartDateChange(){
  //   this.absenceForm.get('startDate')?.valueChanges.subscribe((selectedDate) => {
  //     if (!selectedDate) return;

  //     const startDate = new Date(selectedDate);
  //     const endDateControl = this.absenceForm.get('endDate');
  //     const endDateValue = endDateControl?.value;

  //     // Only update endDate if startDate is after endDate
  //     if (endDateValue) {
  //       const endDate = new Date(endDateValue);

  //       if (startDate > endDate) {
  //         endDateControl?.patchValue(startDate, { emitEvent: false });
  //         this.cd.markForCheck(); // For OnPush change detection
  //       }
  //     } else {
  //       // Optionally set endDate to startDate if it's empty
  //       this.absenceForm.patchValue({ endDate: startDate }, { emitEvent: false });
  //     }
  //   });
  // }


 enableCreateMode(): void {
  this.createMode = true;
  this.isNew = true;
  this.resetForm();

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  this.absenceForm.patchValue({
    startDate: today,
    startTimeHours: 0,
    startTimeMinutes: 0,
    endDate: tomorrow,
    endTimeHours: 0,
    endTimeMinutes: 0,
  });
}

  private resetForm(): void {
  this.absenceForm.reset(
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

  if (this.isNew) {
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
  }

  return null;
}
changeEndDateAfterStartDateChange() {
  this.absenceForm.get('startDate')?.valueChanges.subscribe(() => {
    this.absenceForm.updateValueAndValidity();
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
  this.isNew = this.absenceId === 'new' || !this.absenceId;
  this.editMode = this.isNew;

  if (this.createMode || this.absenceId === 'new') {
    this.isNew = true;
    this.editMode = true;
    this.resetForm();
    this.enableForm();

    this.absenceForm.get('startTimeMinutes')?.enable({ emitEvent: false });
    this.absenceForm.get('endTimeMinutes')?.enable({ emitEvent: false });

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    this.absenceForm.patchValue({
      startDate: today,
      startTimeHours: 0,
      startTimeMinutes: 0,
      endDate: tomorrow,
      endTimeHours: 0,
      endTimeMinutes: 0,
    });

    this.absenceForm.updateValueAndValidity();
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
        console.log('Full HTTP Response:', response);
        console.log('Response Body:', response.body);
        console.log('Status Code:', response.status);

        this.dialog.open(InfoDialogComponent, {
          data: {
            title: 'Erfolgreich erstellt',
            detail: 'Die Abwesenheit wurde erfolgreich erstellt!'
          },
          panelClass: 'custom-dialog-width'
        });

        this.saved.emit();
        this.submitting = false;
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
        console.log('Full HTTP Response:', response);
        console.log('Response Body:', response.body);
        console.log('Status Code:', response.status);

        this.dialog.open(InfoDialogComponent, {
          data: {
            title: 'Erfolgreich gespeichert',
            detail: 'Die Abwesenheit wurde erfolgreich gespeichert!'
          },
          panelClass: 'custom-dialog-width'
        });

        this.saved.emit();
        this.submitting = false;
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


  delete(row: ApiStempelzeit) {

    console.log('selected-row', row);
    row.deleted= true;
    this.abwesenheitService.deleteAbwesenheit(row).subscribe((data: ApiStempelzeit[]) => {
      this.saved.emit();

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
  // Restore full validator when exiting
  this.absenceForm.clearValidators();
this.absenceForm.setValidators(this.dateRangeValidator.bind(this));
  this.absenceForm.updateValueAndValidity();
  this.disableForm();
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

  formatTimeValue(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
adjustTime(field: string, direction: 1 | -1, max: number): void {
  const control = this.absenceForm.get(field);
  if (!control) return;

  const current = control.value !== null && control.value !== undefined
    ? Number(control.value)
    : 0;
  const currentNum = isNaN(current) ? 0 : current;

  const newVal = Math.max(0, Math.min(max, currentNum + direction));
  control.patchValue(newVal, { emitEvent: true });
  control.markAsTouched();

  if (field === 'startTimeHours' || field === 'endTimeHours') {
    const minutesField = field === 'startTimeHours'
      ? 'startTimeMinutes'
      : 'endTimeMinutes';
    const minutesControl = this.absenceForm.get(minutesField);
    if (minutesControl) {
      if (newVal === 24) {
        minutesControl.patchValue(0, { emitEvent: false });
        minutesControl.disable();
      } else {
        minutesControl.enable();
      }
    }
  }

  this.absenceForm.updateValueAndValidity();
}
}
