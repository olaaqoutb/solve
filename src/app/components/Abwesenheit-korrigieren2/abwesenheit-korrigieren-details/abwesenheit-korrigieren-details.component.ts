import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';

import { FormValidationService } from '../../../services/utils/form-validation.service';
import { TimeUtilityService } from '../../../services/utils/time-utility.service';
import { DateParserService } from '../../../services/utils/date-parser.service';
import { TimeOverlapService } from '../../../services/utils/time-overlap.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { DummyService } from '../../../services/dummy.service';


interface AbwesenheitEntry {
  id: string;
  version: number;
  deleted: boolean;
  login: string;
  logoff: string;
  anmerkung?: string;
  zeitTyp: string;
  poKorrektur: boolean;
  marker: string[];
  eintragungsart: string;
}
@Component({
  selector: 'app-abwesenheit-korrigieren-details',
 imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
    templateUrl: './abwesenheit-korrigieren-details.component.html',
  styleUrl: './abwesenheit-korrigieren-details.component.scss'
})
export class AbwesenheitKorrigierenDetailsComponent {
  abwesenheitForm: FormGroup;
  entries: AbwesenheitEntry[] = [];
  selectedEntry: AbwesenheitEntry | null = null;
  selectedIndex: number = -1;
  isEditing = false;
  isCreatingNew = false;
  isLoading = true;
  employeeName: string = '';

  private fieldDisplayMap: { [key: string]: string } = {
    'startDatum': 'Start Datum',
    'startStunde': 'Start Stunde',
    'startMinuten': 'Start Minuten',
    'endeDatum': 'Ende Datum',
    'endeStunde': 'Ende Stunde',
    'endeMinuten': 'Ende Minuten',
    'anmerkung': 'Anmerkung'
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dummyService: DummyService,
    private formValidationService: FormValidationService,
    private timeUtilityService: TimeUtilityService,
    private dateParserService: DateParserService,
    private timeOverlapService: TimeOverlapService
  ) {
    this.abwesenheitForm = this.createAbwesenheitForm();
  }

  ngOnInit() {
    this.loadData();
  }

  private createAbwesenheitForm(): FormGroup {
    return this.fb.group({
      startDatum: ['', Validators.required],
      startStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      startMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      endeDatum: ['', Validators.required],
      endeStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      endeMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      anmerkung: ['']
    });
  }

  loadData() {
    this.isLoading = true;

    // Load data from DummyService
    this.dummyService.getAbwesenheitKorrigieren().subscribe({
      next: (data) => {
        this.entries = data as AbwesenheitEntry[];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Abwesenheit data:', error);
        this.snackBar.open('Fehler beim Laden der Daten', 'Schließen', {
          duration: 3000,
          verticalPosition: 'top'
        });
        this.isLoading = false;
      }
    });
  }

  onRowClick(entry: AbwesenheitEntry, index: number) {
    this.selectedEntry = entry;
    this.selectedIndex = index;
    this.isEditing = false;
    this.isCreatingNew = false;
    this.populateForm(entry);
    this.abwesenheitForm.disable();
  }

  populateForm(entry: AbwesenheitEntry) {
    const loginDate = new Date(entry.login);
    const logoffDate = new Date(entry.logoff);

    this.abwesenheitForm.patchValue({
      startDatum: this.dateParserService.formatToGermanDate(loginDate),
      startStunde: loginDate.getHours(),
      startMinuten: loginDate.getMinutes(),
      endeDatum: this.dateParserService.formatToGermanDate(logoffDate),
      endeStunde: logoffDate.getHours(),
      endeMinuten: logoffDate.getMinutes(),
      anmerkung: entry.anmerkung || ''
    });
  }

  addNewEntry() {
    const currentTime = new Date();
    const currentDateString = currentTime.toLocaleDateString('de-DE');

    this.isCreatingNew = true;
    this.isEditing = true;
    this.selectedEntry = null;
    this.selectedIndex = -1;

    this.abwesenheitForm.reset();
    this.abwesenheitForm.enable();
    this.abwesenheitForm.patchValue({
      startDatum: currentDateString,
      startStunde: 0,
      startMinuten: 0,
      endeDatum: currentDateString,
      endeStunde: 0,
      endeMinuten: 0,
      anmerkung: ''
    });
  }

  saveAbwesenheit() {
    this.formValidationService.validateAllFields(this.abwesenheitForm);

    if (!this.abwesenheitForm.valid) {
      this.showValidationErrors();
      return;
    }

    const formValue = this.abwesenheitForm.getRawValue();

    // Validate 24-hour rule
    if (!this.validateHour24Rule(formValue, 'start') || !this.validateHour24Rule(formValue, 'end')) {
      return;
    }

    if (this.isCreatingNew) {
      this.saveNewEntry(formValue);
    } else if (this.selectedEntry) {
      this.updateExistingEntry(formValue);
    }

    this.snackBar.open('Änderungen gespeichert!', 'Schließen', {
      duration: 3000,
      verticalPosition: 'top'
    });

    this.isEditing = false;
    this.isCreatingNew = false;
    this.abwesenheitForm.disable();
  }

  private saveNewEntry(formValue: any) {
    const startDate = this.dateParserService.parseGermanDate(formValue.startDatum);
    const endDate = this.dateParserService.parseGermanDate(formValue.endeDatum);

    if (!startDate || !endDate) return;

    const loginDate = new Date(startDate);
    loginDate.setHours(formValue.startStunde, formValue.startMinuten, 0, 0);

    const logoffDate = new Date(endDate);
    logoffDate.setHours(formValue.endeStunde, formValue.endeMinuten, 0, 0);

    const newEntry: AbwesenheitEntry = {
      id: `new-${Date.now()}`,
      version: 1,
      deleted: false,
      login: loginDate.toISOString(),
      logoff: logoffDate.toISOString(),
      anmerkung: formValue.anmerkung || '',
      zeitTyp: 'ABWESENHEIT',
      poKorrektur: false,
      marker: [],
      eintragungsart: 'NORMAL'
    };

    this.entries.unshift(newEntry);
    this.selectedEntry = newEntry;
    this.selectedIndex = 0;
  }

  private updateExistingEntry(formValue: any) {
    if (!this.selectedEntry) return;

    const startDate = this.dateParserService.parseGermanDate(formValue.startDatum);
    const endDate = this.dateParserService.parseGermanDate(formValue.endeDatum);

    if (!startDate || !endDate) return;

    const loginDate = new Date(startDate);
    loginDate.setHours(formValue.startStunde, formValue.startMinuten, 0, 0);

    const logoffDate = new Date(endDate);
    logoffDate.setHours(formValue.endeStunde, formValue.endeMinuten, 0, 0);

    this.selectedEntry.login = loginDate.toISOString();
    this.selectedEntry.logoff = logoffDate.toISOString();
    this.selectedEntry.anmerkung = formValue.anmerkung || '';

    // Update the entry in the array
    if (this.selectedIndex >= 0) {
      this.entries[this.selectedIndex] = { ...this.selectedEntry };
    }

    this.cdr.detectChanges();
  }

  async deleteEntry() {
    if (!this.selectedEntry || this.isCreatingNew) return;

    const confirmed = await this.showDeleteConfirmation();

    if (confirmed) {
      this.entries = this.entries.filter(e => e.id !== this.selectedEntry!.id);
      this.selectedEntry = null;
      this.selectedIndex = -1;
      this.abwesenheitForm.reset();

      this.snackBar.open('Eintrag gelöscht!', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top'
      });
    }
  }

  private async showDeleteConfirmation(): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {
        title: 'Löschen bestätigen',
        message: 'Wollen Sie diesen Eintrag wirklich löschen?',
        confirmText: 'Ja',
        cancelText: 'Nein'
      }
    });
    return await dialogRef.afterClosed().toPromise() === true;
  }

  cancelFormChanges() {
    if (this.isCreatingNew) {
      this.selectedEntry = null;
      this.selectedIndex = -1;
      this.abwesenheitForm.reset();
      this.isCreatingNew = false;
    } else if (this.selectedEntry) {
      this.populateForm(this.selectedEntry);
    }

    this.isEditing = false;
    this.abwesenheitForm.disable();
  }

  adjustTime(type: 'start' | 'end', unit: 'hour' | 'minute', amount: number) {
    if (!this.isEditing && !this.isCreatingNew) return;

    const controlName =
      type === 'start' && unit === 'hour' ? 'startStunde' :
      type === 'start' && unit === 'minute' ? 'startMinuten' :
      type === 'end' && unit === 'hour' ? 'endeStunde' : 'endeMinuten';

    const control = this.abwesenheitForm.get(controlName);

    if (control) {
      let currentVal = control.value || 0;
      let newVal = currentVal + amount;

      if (unit === 'hour') {
        const max = 24;
        if (newVal < 0) newVal = max;
        if (newVal > max) newVal = 0;

        control.setValue(newVal);

        if (newVal === 24) {
          const minuteControlName = type === 'start' ? 'startMinuten' : 'endeMinuten';
          const minuteControl = this.abwesenheitForm.get(minuteControlName);
          if (minuteControl && minuteControl.value !== 0) {
            minuteControl.setValue(0);
          }
        }
      } else {
        const hourControlName = type === 'start' ? 'startStunde' : 'endeStunde';
        const hourControl = this.abwesenheitForm.get(hourControlName);
        const currentHour = hourControl?.value || 0;

        if (currentHour === 24) {
          this.snackBar.open(
            'Bei 24 Stunden müssen die Minuten 0 bleiben',
            'Schließen',
            { duration: 3000, verticalPosition: 'top' }
          );
          control.setValue(0);
          return;
        }

        const max = 59;
        if (newVal < 0) newVal = max;
        if (newVal > max) newVal = 0;

        control.setValue(newVal);
      }
    }
  }

  private validateHour24Rule(formValue: any, formType: 'start' | 'end'): boolean {
    const hour = formType === 'start' ? formValue.startStunde : formValue.endeStunde;
    const minute = formType === 'start' ? formValue.startMinuten : formValue.endeMinuten;

    if (hour === 24 && minute !== 0) {
      this.snackBar.open(
        `${formType === 'start' ? 'Start' : 'Ende'}: Bei 24 Stunden müssen die Minuten 0 sein`,
        'Schließen',
        { duration: 5000, verticalPosition: 'top' }
      );
      return false;
    }
    return true;
  }

  private showValidationErrors(): void {
    const errors = this.formValidationService.getValidationErrors(
      this.abwesenheitForm,
      this.fieldDisplayMap
    );

    if (errors.length > 0) {
      const errorMessage = this.formValidationService.formatValidationErrors(errors);
      this.snackBar.open(errorMessage, 'Schließen', {
        duration: 5000,
        verticalPosition: 'top'
      });
    }
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBackToList() {
    this.router.navigate(['/abwesenheit']);
  }
}
