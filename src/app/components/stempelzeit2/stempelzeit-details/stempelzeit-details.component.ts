import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { Person } from "../../../models/stempelzeit-details/person.model"
import { StempelzeitNode, FlatNode, FormData, TimeData } from '../../../models/stempelzeit-details';
import { DummyService } from '../../../services/dummy.service';
import { ApiStempelzeit } from '../../../models-2/ApiStempelzeit';
import { ApiStempelzeitMarker } from '../../../models-2/ApiStempelzeitMarker';
import { ApiAbschlussInfo } from '../../../models-2/ApiAbschlussInfo';
import { forkJoin } from 'rxjs';
import { ApiProdukt } from '../../../models-2/ApiProdukt';
import { DateParserService } from '../../../services/utils/date-parser.service';

// import { StempelzeitService } from '../../../services/stempelzeit.service';
import { ApiZeitTyp, getApiZeitTypDisplayValues } from '../../../models-2/ApiZeitTyp';
import { MatDatepicker } from "@angular/material/datepicker";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../../services/custom-date-adapter.service';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';
import { InfoDialogComponent } from '../../dialogs/info-dialog/info-dialog.component';
import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog/delete-confirm-dialog.component';

export const DATE_FORMATS = {
  parse: { dateInput: 'DD.MM.YYYY' },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-stempelzeit-details',
  templateUrl: './stempelzeit-details.component.html',
  styleUrls: ['./stempelzeit-details.component.scss'],
  standalone: true,
  imports: [MatProgressSpinnerModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    CommonModule,
    ConfirmationDialogComponent, MatDatepicker,
   MatDatepickerModule,
    MatNativeDateModule,
   ErrorDialogComponent,
  InfoDialogComponent,
  DeleteConfirmDialogComponent,] ,
    providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
  ],
})
export class StempelzeitDetailsComponent implements OnInit {
  zeittypOptions = Object.keys(ApiZeitTyp).map(key => ({
    key: key,
    value: ApiZeitTyp[key as keyof typeof ApiZeitTyp]
  }));
  private clickTimeout: any = null;
  private lastClickedNode: FlatNode | null = null;
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );


  private transformer = (node: StempelzeitNode, level: number): FlatNode => {
    return {
     expandable: !!node.children,
      name: node.name,
      level: level,
      hasNotification: node.hasNotification || false,
      formData: node.formData,
      timeEntry: node.timeEntry
    };
  };
  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
private pendingParentDayNode: FlatNode | null = null;
  stempelzeitForm: FormGroup;
  selectedNode: FlatNode | null = null;
  isEditing = false;
  isLoading = true;
  personName: string = '';
  isCreatingNew = false;
  newNode: FlatNode | null = null;
  personId!: string;
  abschlussInfo: ApiAbschlussInfo | null = null;
  private previousExpandedState = new Set<FlatNode>();
  produktOptions: ApiProdukt[] = [];

highlightedDayNode: FlatNode | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dummyService: DummyService,
    private dateParserService: DateParserService,
    // private dummyService: StempelzeitService,
  ) {
    this.stempelzeitForm = this.createForm();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.personId = params.get('id') || '';
      if (this.personId) {
        this.loadDataFromJson(this.personId);
        this.getPersonName(this.personId);
      }
    });
  }

  loadDataFromJson(id: string) {
    this.isLoading = true;

    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    forkJoin({
      stempelzeiten: this.dummyService.getPersonStempelzeitenNoAbwesenheit2(id),
      abschlussInfo: this.dummyService.getPersonAbschlussInfo1(id),
      products: this.dummyService.getPersonProdukte1(
        id,
        'KORREKTUR',
        startDate,
        endDate
      )
    }).subscribe({
      next: (results) => {
        this.abschlussInfo = results.abschlussInfo;
        this.produktOptions = results.products;

        const timeEntries: ApiStempelzeit[] = results.stempelzeiten.map(s => ({
          id: s.id ?? '',
          login: s.login!,
          logoff: s.logoff!,
          zeitTyp: s.zeitTyp!,
          poKorrektur: s.poKorrektur ?? false,
          anmerkung: s.anmerkung ?? ''
        }));

        const treeData = this.transformJsonToTree(timeEntries);
        this.dataSource.data = treeData;
        this.isLoading = false;
              this.autoExpandLatestMonthNodes();

      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
          // this.autoExpandLatestMonthNodes();

      }
    });
  }

  loadPersonData() {
    this.route.paramMap.subscribe(params => {
      const personId = params.get('id');
      console.log('person ID from route:', personId);
      if (personId) {
        this.loadDataFromJson(personId);

        this.getPersonName(personId);
      } else {
        console.error('No person ID found in route');
        this.personName = 'Unbekannter Mitarbeiter';
      }
    });
  }

  getPersonName(personId: string) {

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const person = navigation.extras.state['person'] as Person;
      console.log('person from navigation state:', person);
      if (person) {
        this.personName = `${person.vorname} ${person.nachname}`;
        console.log('person name set from state:', this.personName);
        return;
      }
    }

    this.http.get<Person[]>('stempelzeit-list.json').subscribe({
      next: (data: Person[]) => {
        console.log('person data from JSON:', data);

        const person = data.find(emp =>
          emp.id?.toString() === personId.toString()
        );

        console.log('Found person:', person);

        if (person) {
          this.personName = `${person.vorname} ${person.nachname}`;
        } else {
          this.personName = 'Unbekannter Mitarbeiter';
        }
        console.log('Final person name:', this.personName);
      },
      error: (error) => {
        console.error('Error loading person data:', error);
        this.personName = 'Unbekannter Mitarbeiter';
      }
    });
  }

  goBackToList() {
    this.router.navigate(['/timestamps']);
  }
  getGebuchtTime(node: FlatNode): string {
    if (node.level !== 1 || !node.expandable) return '00:00';

    const treeData = this.dataSource.data;
    let totalMinutes = 0;

    const findNodeAndCalculateTime = (nodes: StempelzeitNode[]): boolean => {
      for (const treeNode of nodes) {
        if (treeNode.name === node.name && treeNode.children) {
          treeNode.children.forEach(child => {
            if (child.timeEntry) {
              const login = new Date(child.timeEntry.login!);
              const logoff = new Date(child.timeEntry.logoff!);
              const duration = (logoff.getTime() - login.getTime()) / (1000 * 60);
              totalMinutes += duration;
            }
          });
          return true;
        }
        if (treeNode.children && findNodeAndCalculateTime(treeNode.children)) {
          return true;
        }
      }
      return false;
    };

    findNodeAndCalculateTime(treeData);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getZeittypDisplay(zeitTyp: string): string {
    const option = this.zeittypOptions.find(o => o.key === zeitTyp);
    return option ? option.value : zeitTyp;
  }

transformJsonToTree(timeEntries: ApiStempelzeit[]): StempelzeitNode[] {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;


  const filteredEntries = timeEntries.filter(entry => {
    if (!entry.login) return false;
    const loginDate = new Date(entry.login);
    const entryMonth = loginDate.getMonth();
    const entryYear = loginDate.getFullYear();
    const isCurrentMonth = entryMonth === currentMonth && entryYear === currentYear;
    const isPrevMonth = entryMonth === prevMonth && entryYear === prevYear;
    return isCurrentMonth || isPrevMonth;
  });

  const groupedByMonth: { [key: string]: ApiStempelzeit[] } = {};

  filteredEntries.forEach(entry => {
    const loginDate = new Date(entry.login!);
    const monthYear = this.getMonthYearString(loginDate);
    if (!groupedByMonth[monthYear]) groupedByMonth[monthYear] = [];
    groupedByMonth[monthYear].push(entry);
  });

  // Ensure both months always appear even if empty
  const prevMonthName = this.getMonthYearString(new Date(prevYear, prevMonth, 1));
  const currentMonthName = this.getMonthYearString(new Date(currentYear, currentMonth, 1));
  if (!groupedByMonth[prevMonthName]) groupedByMonth[prevMonthName] = [];
  if (!groupedByMonth[currentMonthName]) groupedByMonth[currentMonthName] = [];

  const treeData: StempelzeitNode[] = [];

  Object.keys(groupedByMonth).sort((a, b) => {
    const dateA = this.parseMonthYearString(a);
    const dateB = this.parseMonthYearString(b);
    return dateA.getTime() - dateB.getTime();
  }).forEach(monthYear => {
    const monthEntries = groupedByMonth[monthYear];

    const monthNode: StempelzeitNode = {
      name: monthYear,
      hasNotification: this.hasNotifications(monthEntries),
      children: []
    };

    const groupedByDay: { [key: string]: ApiStempelzeit[] } = {};

    monthEntries.forEach(entry => {
      const loginDate = new Date(entry.login!);
      const dayKey = this.formatDayName(loginDate);
      if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
      groupedByDay[dayKey].push(entry);
    });

    Object.keys(groupedByDay).sort((a, b) => {
      const dateA = this.getDateFromFormattedDay(a);
      const dateB = this.getDateFromFormattedDay(b);
      return dateA.getTime() - dateB.getTime();
    }).forEach(dayKey => {
      const dayEntries = groupedByDay[dayKey];

      const dayNode: StempelzeitNode = {
        name: dayKey,
        hasNotification: this.hasNotifications(dayEntries),
        children: []
      };

      dayEntries.forEach(entry => {
        const loginTime = new Date(entry.login!);
        const logoffTime = new Date(entry.logoff!);

        const entryNode: StempelzeitNode = {
          name: `${this.formatTime(loginTime)} - ${this.formatTime(logoffTime)}`,
          date: loginTime.toLocaleDateString('de-DE'),
          hasNotification: !!entry.marker,
          timeEntry: entry,
          formData: {
            datum: loginTime.toLocaleDateString('de-DE'),
            zeittyp: entry.zeitTyp as string,
            anmeldezeit: { stunde: loginTime.getHours(), minuten: loginTime.getMinutes() },
            abmeldezeit: { stunde: logoffTime.getHours(), minuten: logoffTime.getMinutes() },
            anmerkung: this.generateAnmerkung(entry)
          }
        };

        dayNode.children!.push(entryNode);
      });

      monthNode.children!.push(dayNode);
    });

    treeData.push(monthNode);
  });

  return treeData;
}
  private getDateFromFormattedDay(dayString: string): Date {
    const parts = dayString.split(' ');
    if (parts.length < 3) {
      return new Date();
    }
    const dayNumber = parseInt(parts[1].replace('.', ''), 10);
    const monthName = parts[2];

    const months: { [key: string]: number } = {
      'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
      'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
    };

    const month = months[monthName] || 0;
    const year = new Date().getFullYear();

    return new Date(year, month, dayNumber);
  }
  private parseMonthYearString(monthYear: string): Date {
    const months: { [key: string]: number } = {
      'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
      'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
    };

    const [monthName, year] = monthYear.split(' ');
    const month = months[monthName];
    return new Date(parseInt(year), month, 1);
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  private getMonthYearString(date: Date): string {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private hasNotifications(entries: ApiStempelzeit[]): boolean {
    return entries.some(entry => !!entry.marker);
  }

  private generateAnmerkung(entry: ApiStempelzeit): string {
    const parts: string[] = [];

    if (entry.poKorrektur) {
      parts.push('PO Korrektur');
    }

    if (entry.marker) {
      parts.push(`Marker: ${entry.marker}`);
    }

    return parts.join(' | ') || 'Keine Anmerkungen';
  }


  createForm(): FormGroup {
    return this.fb.group({
      datum: ['', Validators.required],
      zeittyp: ['', Validators.required],
      anmeldezeitStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      anmeldezeitMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      abmeldezeitStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      abmeldezeitMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      anmerkung: ['']
    });
  }
  private isTimeValid(formValue: any): boolean {
    const {
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    console.log('Validating time:', {
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    });

    if (anmeldezeitStunde < 0 || anmeldezeitStunde > 24 ||
      abmeldezeitStunde < 0 || abmeldezeitStunde > 24 ||
      anmeldezeitMinuten < 0 || anmeldezeitMinuten > 59 ||
      abmeldezeitMinuten < 0 || abmeldezeitMinuten > 59) {
      console.log('Time range validation failed');
      return false;
    }

    if ((anmeldezeitStunde === 24 && anmeldezeitMinuten !== 0) ||
      (abmeldezeitStunde === 24 && abmeldezeitMinuten !== 0)) {
      console.log('Hour 24 validation failed - minutes must be 0');
      return false;
    }

    const startTotalMinutes = anmeldezeitStunde * 60 + anmeldezeitMinuten;
    const endTotalMinutes = abmeldezeitStunde * 60 + abmeldezeitMinuten;

    console.log('Time comparison:', { startTotalMinutes, endTotalMinutes });

    if (startTotalMinutes === endTotalMinutes) {
      console.log('Times are equal - valid');
      return true;
    }

    const isValid = endTotalMinutes > startTotalMinutes;
    console.log('Time sequence validation:', isValid);
    return isValid;
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  onNodeClick(node: FlatNode) {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    this.clickTimeout = setTimeout(() => {
      this.handleSingleClick(node);
      this.clickTimeout = null;
      this.lastClickedNode = null;
    }, 250);
  }
  onNodeDoubleClick(node: FlatNode) {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    this.handleDoubleClick(node);
    this.lastClickedNode = null;
  }

  private handleSingleClick(node: FlatNode) {
    console.log('Single click on:', node.name, 'Level:', node.level);

    if (this.isCreatingNew && this.newNode) {
      this.cancelNewEntrySilently();
    }

    if (node.level === 2 && node.formData) {

      this.selectedNode = node;
      this.populateForm(node.formData);
      this.isEditing = false;
      this.isCreatingNew = false;
      this.updateFormControlsState();
    } else if (node.expandable) {
      this.selectedNode = node;

    } else {
      this.selectedNode = node;
      this.stempelzeitForm.reset();
      this.isEditing = false;
      this.isCreatingNew = false;
      this.updateFormControlsState();
    }
  }
  private handleDoubleClick(node: FlatNode) {
    console.log('Double click on:', node.name, 'Level:', node.level, 'Expandable:', node.expandable);

    if (node.expandable) {
      this.treeControl.toggle(node);
      console.log('Toggled expansion for node:', node.name);
    }

    if (!node.expandable && node.level === 2 && node.formData) {
      this.selectedNode = node;
      this.populateForm(node.formData);
      this.isEditing = false;
      this.isCreatingNew = false;
      this.updateFormControlsState();
    }
  }
populateForm(formData?: FormData) {
  if (formData) {
    const datumAsDate = this.dateParserService.parseGermanDate(formData.datum);

    this.stempelzeitForm.patchValue({
      datum: datumAsDate,
      zeittyp: formData.zeittyp,
      anmeldezeitStunde: formData.anmeldezeit.stunde,
      anmeldezeitMinuten: formData.anmeldezeit.minuten,
      abmeldezeitStunde: formData.abmeldezeit.stunde,
      abmeldezeitMinuten: formData.abmeldezeit.minuten,
      anmerkung: formData.anmerkung
    });


    if (this.isCreatingNew) {
      this.stempelzeitForm.get('datum')?.enable();
    } else {
      this.stempelzeitForm.get('datum')?.disable();
    }

    this.stempelzeitForm.markAsPristine();
  }
}
saveForm() {
   const datumControl = this.stempelzeitForm.get('datum');
  const wasDatumDisabled = datumControl?.disabled;

  if (!this.isCreatingNew) {
    const rawValue = this.stempelzeitForm.getRawValue();
    const datum = rawValue.datum;
    if (datum) {
      const selectedDate = datum instanceof Date
        ? datum
        : this.dateParserService.parseGermanDate(datum);
      if (selectedDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);
        if (selectedDateOnly > today) {
          this.showErrorDialog(
            'Ungültiges Datum',
            'Das Datum liegt in der Zukunft. Einträge mit zukünftigem Datum können nicht gespeichert werden.'
          );
          return;
        }
      }
    }
  }

  if (wasDatumDisabled) {
    datumControl?.enable();
    this.stempelzeitForm.updateValueAndValidity();
  }

  this.validateAllFormFields(this.stempelzeitForm);

  if (!this.stempelzeitForm.valid || !this.selectedNode) {
    if (wasDatumDisabled) datumControl?.disable();
    this.showValidationErrors();
    return;
  }

  const formValue = this.stempelzeitForm.getRawValue();

  // Date/time validation
  const dateTimeValidation = this.validateDateAndTime(formValue);
  if (!dateTimeValidation.isValid) {
    if (wasDatumDisabled) datumControl?.disable();
    this.showErrorDialog(dateTimeValidation.errorTitle!, dateTimeValidation.errorMessage!);
    return;
  }

  const datumRaw = formValue.datum;
  const datumValue = datumRaw instanceof Date
    ? this.dateParserService.formatToGermanDate(datumRaw)
    : datumRaw;

  const selectedDate = datumRaw instanceof Date
    ? datumRaw
    : this.dateParserService.parseGermanDate(datumValue);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateOnly = new Date(selectedDate!);
  selectedDateOnly.setHours(0, 0, 0, 0);

  // Overlap validation
  const validationResult = this.validateTimeEntryOverlap(formValue);
  if (!validationResult.isValid) {
    if (wasDatumDisabled) datumControl?.disable();
    this.showErrorDialog(
      'Zeitüberschneidung',
      validationResult.errorMessage || 'Ungültige Zeitangaben'
    );
    return;
  }

  // Update local formData
  if (this.selectedNode.formData) {
    this.selectedNode.formData.datum = datumValue;
    this.selectedNode.formData.zeittyp = formValue.zeittyp;
    this.selectedNode.formData.anmeldezeit.stunde = formValue.anmeldezeitStunde;
    this.selectedNode.formData.anmeldezeit.minuten = formValue.anmeldezeitMinuten;
    this.selectedNode.formData.abmeldezeit.stunde = formValue.abmeldezeitStunde;
    this.selectedNode.formData.abmeldezeit.minuten = formValue.abmeldezeitMinuten;
    this.selectedNode.formData.anmerkung = formValue.anmerkung;
  }

  this.selectedNode.name = `${this.formatTimeFromNumbers(formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten)} - ${this.formatTimeFromNumbers(formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten)}`;

  if (this.selectedNode.timeEntry) {
    if (selectedDate) {
      const loginTime = new Date(selectedDate);
      loginTime.setHours(formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten, 0, 0);
      const logoffTime = new Date(selectedDate);
      logoffTime.setHours(formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten, 0, 0);
      this.selectedNode.timeEntry.login = loginTime.toISOString();
      this.selectedNode.timeEntry.logoff = logoffTime.toISOString();
    }
    this.selectedNode.timeEntry.zeitTyp = formValue.zeittyp;
  }

  const dto: ApiStempelzeit = {
    id: this.selectedNode.timeEntry?.id,
    login: this.selectedNode.timeEntry?.login,
    logoff: this.selectedNode.timeEntry?.logoff,
    zeitTyp: this.selectedNode.timeEntry?.zeitTyp as ApiZeitTyp,
    poKorrektur: this.selectedNode.timeEntry?.poKorrektur,
    anmerkung: formValue.anmerkung || '',
  };

  this.dummyService.updateStempelzeit(dto, dto.id!).subscribe({
    next: () => {
      if (wasDatumDisabled) datumControl?.disable();
      this.showInfoDialog('Erfolgreich gespeichert', 'Änderungen wurden erfolgreich gespeichert!');
      this.isEditing = false;
      this.isCreatingNew = false;
    this.saveExpandedState();
this.dataSource.data = [...this.dataSource.data];
this.restoreExpandedState();

      this.stempelzeitForm.markAsPristine();
    },
    error: () => {
      if (wasDatumDisabled) datumControl?.disable();
      this.showErrorDialog('Fehler beim Speichern', 'Der Eintrag konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.');
    }
  });
}

  private validateAllFormFields(formGroup: FormGroup): void {
    if (!formGroup || !formGroup.controls) return;

    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (!control) return;

      if ((control as any).controls) {
        this.validateAllFormFields(control as FormGroup);
      } else {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }
  private showValidationErrors(): void {
  const errors = this.getFormValidationErrors();

  const message = errors.length > 0
    ? this.formatValidationErrors(errors)
    : 'Bitte füllen Sie alle erforderlichen Felder aus.';

  this.showErrorDialog('Ungültige Eingabe', message);
}
  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const controls = this.stempelzeitForm.controls;

    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          switch (errorKey) {
            case 'required':
              errors.push(this.getFieldDisplayName(key) + ' ist erforderlich');
              break;
            case 'min':
              errors.push(this.getFieldDisplayName(key) + ' ist zu niedrig');
              break;
            case 'max':
              errors.push(this.getFieldDisplayName(key) + ' ist zu hoch');
              break;
            default:
              errors.push(this.getFieldDisplayName(key) + ' ist ungültig');
          }
        });
      }
    });

    return errors;
  }
  private getFieldDisplayName(fieldName: string): string {
    const fieldMap: { [key: string]: string } = {
      'datum': 'Datum',
      'zeittyp': 'Zeittyp',
      'anmeldezeitStunde': 'Anmeldezeit Stunde',
      'anmeldezeitMinuten': 'Anmeldezeit Minuten',
      'abmeldezeitStunde': 'Abmeldezeit Stunde',
      'abmeldezeitMinuten': 'Abmeldezeit Minuten',
      'anmerkung': 'Anmerkung'
    };

    return fieldMap[fieldName] || fieldName;
  }

  private formatValidationErrors(errors: string[]): string {
    if (errors.length === 1) {
      return errors[0];
    }

    return 'Bitte korrigieren Sie folgende Fehler: ' + errors.slice(0, 3).join(', ');
  }
  cancelFormChanges() {
    if (this.isCreatingNew) {
      this.cancelNewEntry();
    } else if (this.selectedNode) {
      this.populateForm(this.selectedNode.formData);
      this.isEditing = false;
    }
  }

  private cancelNewEntrySilently() {
  this.isCreatingNew = false;
  this.isEditing = false;
  this.newNode = null;
  this.pendingParentDayNode = null;
  this.highlightedDayNode = null;
  this.selectedNode = null;
  this.stempelzeitForm.reset();
}
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private expandedNodesSet = new Set<FlatNode>();

  private saveExpandedState() {
    this.expandedNodesSet.clear();
    const expandedNodes = this.treeControl.dataNodes.filter(node =>
      this.treeControl.isExpanded(node)
    );
    expandedNodes.forEach(node => this.expandedNodesSet.add(node));
    console.log('Saved expanded state:', this.expandedNodesSet.size, 'nodes');
  }

  private restoreExpandedState() {
    console.log('Restoring expanded state for', this.expandedNodesSet.size, 'nodes');

    this.treeControl.dataNodes.forEach(node => {
      const wasExpanded = Array.from(this.expandedNodesSet).some(savedNode =>
        savedNode.name === node.name &&
        savedNode.level === node.level &&
        savedNode.expandable === node.expandable
      );

      if (wasExpanded && !this.treeControl.isExpanded(node)) {
        this.treeControl.expand(node);
      }
    });

    console.log('After restore - expanded nodes:', this.treeControl.expansionModel.selected.length);
  }

 addTimeEntry(node: FlatNode, event: Event) {
  event.stopPropagation();
  event.preventDefault();

  if (this.isCreatingNew && this.newNode) {
    this.cancelNewEntrySilently();
  }

  if (node.level === 1) {
    const nodeDate = this.getDateFromFormattedDay(node.name);
    const entryDateString = nodeDate.toLocaleDateString('de-DE');

    const tempNewNode: FlatNode = {
      expandable: false,
      name: 'Neuer Eintrag',
      level: 2,
      hasNotification: false,
      formData: {
        datum: entryDateString,
        zeittyp: 'ARBEITSZEIT',
        anmeldezeit: { stunde: 0, minuten: 0 },
        abmeldezeit: { stunde: 0, minuten: 0 },
        anmerkung: ''
      },
      timeEntry: {
        id: `temp-${Date.now()}`,
        login: nodeDate.toISOString(),
        logoff: nodeDate.toISOString(),
        zeitTyp: ApiZeitTyp.ARBEITSZEIT,
        poKorrektur: false
      }
    };

    this.pendingParentDayNode = node;

    this.newNode = tempNewNode;
    this.selectedNode = tempNewNode;
    this.isCreatingNew = true;
    this.isEditing = true;
    this.highlightedDayNode = node;
    this.populateForm(tempNewNode.formData);
  }
}

  private findNewFlatNode(newNode: StempelzeitNode): FlatNode | null {
    const flatNodes = this.treeControl.dataNodes;
    const foundNode = flatNodes.find(node =>
      node.level === 2 &&
      node.timeEntry?.id === newNode.timeEntry?.id
    );

    console.log('Searching for new flat node:', {
      searchingForId: newNode.timeEntry?.id,
      found: !!foundNode,
      totalNodes: flatNodes.length
    });

    return foundNode || null;
  }

  private resetFormState() {
    this.isEditing = false;
    this.isCreatingNew = false;
    this.stempelzeitForm.markAsPristine();
    this.stempelzeitForm.markAsUntouched();
    this.stempelzeitForm.updateValueAndValidity();
  }
saveNewEntry() {
  this.validateAllFormFields(this.stempelzeitForm);

  if (!this.stempelzeitForm.valid || !this.newNode) {
    this.showValidationErrors();
    return;
  }

  const formValue = this.stempelzeitForm.getRawValue();

  // Date/time validation
  const dateTimeValidation = this.validateDateAndTime(formValue);
  if (!dateTimeValidation.isValid) {
    this.showErrorDialog(dateTimeValidation.errorTitle!, dateTimeValidation.errorMessage!);
    return;
  }

  // Overlap validation
  const validationResult = this.validateTimeEntryOverlap(formValue);
  if (!validationResult.isValid) {
    this.showErrorDialog(
      'Zeitüberschneidung',
      validationResult.errorMessage || 'Ungültige Zeitangaben'
    );
    return;
  }

  const datumRaw = formValue.datum;
  const datumValue = datumRaw instanceof Date
    ? this.dateParserService.formatToGermanDate(datumRaw)
    : datumRaw;

  const selectedDate = datumRaw instanceof Date
    ? datumRaw
    : this.dateParserService.parseGermanDate(datumValue);

  if (!selectedDate) {
    this.showErrorDialog('Ungültiges Datum', 'Bitte verwenden Sie das Format TT.MM.JJJJ.');
    return;
  }

  const selectedMonthYear = this.getMonthYearString(selectedDate);
 const selectedDayKey = this.formatDayName(selectedDate);


  const loginTime = new Date(selectedDate);
  loginTime.setHours(formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten, 0, 0);
  const logoffTime = new Date(selectedDate);
  logoffTime.setHours(formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten, 0, 0);

  const newTimeEntry: ApiStempelzeit = {
    id: `new-${Date.now()}`,
    login: loginTime.toISOString(),
    logoff: logoffTime.toISOString(),
    zeitTyp: formValue.zeittyp as ApiZeitTyp,
    poKorrektur: false
  };

  const newEntryNode: StempelzeitNode = {
    name: `${this.formatTime(loginTime)} - ${this.formatTime(logoffTime)}`,
    date: selectedDate.toLocaleDateString('de-DE'),
    hasNotification: false,
    timeEntry: newTimeEntry,
    formData: {
      datum: selectedDate.toLocaleDateString('de-DE'),
      zeittyp: formValue.zeittyp,
      anmeldezeit: { stunde: formValue.anmeldezeitStunde, minuten: formValue.anmeldezeitMinuten },
      abmeldezeit: { stunde: formValue.abmeldezeitStunde, minuten: formValue.abmeldezeitMinuten },
      anmerkung: formValue.anmerkung
    }
  };

  const monthNode = this.findOrCreateMonthNode(selectedMonthYear);
  const dayNode = this.findOrCreateDayNode(monthNode, selectedDayKey, selectedDate);
  if (!dayNode.children) dayNode.children = [];

  this.removeTemporaryNode();
  dayNode.children.push(newEntryNode);
  dayNode.children.sort((a, b) => a.name.split(' - ')[0].localeCompare(b.name.split(' - ')[0]));

  const dto: ApiStempelzeit = {
    login: newTimeEntry.login,
    logoff: newTimeEntry.logoff,
    zeitTyp: newTimeEntry.zeitTyp as ApiZeitTyp,
    poKorrektur: newTimeEntry.poKorrektur,
    anmerkung: formValue.anmerkung || '',
  };

  this.dummyService.createStempelzeit(dto, this.personId).subscribe({
    next: (created) => {
      newTimeEntry.id = created.id!;
      this.dataSource.data = [...this.dataSource.data];
      this.expandParentNodesForNewEntry(selectedMonthYear, selectedDayKey);
      const newFlatNode = this.findNewFlatNode(newEntryNode);
      if (newFlatNode) this.selectedNode = newFlatNode;
      this.showInfoDialog('Erfolgreich gespeichert', 'Neuer Eintrag wurde erfolgreich gespeichert!');
      this.isCreatingNew = false;
      this.isEditing = false;
      this.newNode = null;
       this.pendingParentDayNode = null;
      this.stempelzeitForm.markAsPristine();
    },
    error: () => this.showErrorDialog(
      'Fehler beim Speichern',
      'Der Eintrag konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.'
    )
  });
}
  private removeTemporaryNode(): void {
    if (!this.newNode) return;

    const removeNode = (nodes: StempelzeitNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        const treeNode = nodes[i];
        if (treeNode.children) {
          const index = treeNode.children.findIndex(child =>
            child.timeEntry?.id === this.newNode!.timeEntry?.id
          );
          if (index > -1) {
            treeNode.children.splice(index, 1);
            console.log('Removed temporary node');
            return true;
          }
          if (removeNode(treeNode.children)) {
            return true;
          }
        }
      }
      return false;
    };

    removeNode(this.dataSource.data);
  }
  private parseGermanDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      console.error('parseGermanDate: dateString is null, undefined or not a string');
      return null;
    }

    const trimmedDate = dateString.trim();
    if (trimmedDate === '') {
      console.error('parseGermanDate: dateString is empty');
      return null;
    }

    const parts = trimmedDate.split('.');
    if (parts.length !== 3) {
      console.error('parseGermanDate: Invalid date format - expected DD.MM.YYYY, got:', dateString);
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error('parseGermanDate: Invalid date parts', { day, month, year, original: dateString });
      return null;
    }

    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
      console.error('parseGermanDate: Date out of reasonable range', { day, month, year });
      return null;
    }

    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) {
      console.error('parseGermanDate: Invalid date object created', { day, month, year, result: date });
      return null;
    }
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      console.error('parseGermanDate: Date normalization detected invalid date', {
        input: { day, month: month + 1, year },
        output: { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }
      });
      return null;
    }

    return date;
  }
 cancelNewEntry() {
  this.isCreatingNew = false;
  this.isEditing = false;
  this.newNode = null;
  this.pendingParentDayNode = null;
  this.highlightedDayNode = null;
  this.selectedNode = null;
  this.stempelzeitForm.reset();

  this.snackBar.open('Eintrag verworfen', 'Schließen', {
    duration: 3000,
    verticalPosition: 'top'
  });
}

  private formatTimeFromNumbers(hours: number, minutes: number): string {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return this.formatTime(date);
  }

async deleteEntry() {
  if (this.selectedNode && !this.isCreatingNew) {
    const entryName = this.selectedNode.name;
    const entryDate = this.selectedNode.formData?.datum;

    const confirmed = await this.showDeleteConfirmation(entryName, entryDate);
    if (!confirmed) return;

    const removeNode = (nodes: StempelzeitNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        const treeNode = nodes[i];
        if (treeNode.children) {
          const index = treeNode.children.findIndex(child =>
            child.timeEntry?.id === this.selectedNode!.timeEntry?.id
          );
          if (index > -1) {
            treeNode.children.splice(index, 1);
            return true;
          }
          if (removeNode(treeNode.children)) return true;
        }
      }
      return false;
    };

    if (removeNode(this.dataSource.data)) {
      const dto: ApiStempelzeit = {
        id: this.selectedNode.timeEntry?.id,
        login: this.selectedNode.timeEntry?.login,
        logoff: this.selectedNode.timeEntry?.logoff,
        zeitTyp: this.selectedNode.timeEntry?.zeitTyp as ApiZeitTyp,
        poKorrektur: this.selectedNode.timeEntry?.poKorrektur,
        anmerkung: this.selectedNode.formData?.anmerkung || '',
      };

      this.dummyService.updateStempelzeit(dto, dto.id!).subscribe({
        next: () => {
          this.dataSource.data = [...this.dataSource.data];
          this.selectedNode = null;
          this.isEditing = false;
          this.stempelzeitForm.reset();
          this.showInfoDialog('Erfolgreich gelöscht', 'Der Eintrag wurde erfolgreich gelöscht.');
          this.autoExpandLatestMonthNodes();
        },
        error: () => this.showErrorDialog(
          'Fehler beim Löschen',
          'Der Eintrag konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.'
        )
      });
    }
  } else if (this.isCreatingNew) {
    this.cancelNewEntry();
  }
}

  private async showDeleteConfirmation(entryName: string, entryDate?: string): Promise<boolean> {
  const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
    width: '450px',
    data: {
      absence: { name: entryName, date: entryDate }
    }
  });
  return await dialogRef.afterClosed().toPromise() === true;
}
private showErrorDialog(title: string, detail: string): void {
  this.dialog.open(ErrorDialogComponent, {
    data: { title, detail },
    panelClass: 'custom-dialog-width'
  });
}

private showInfoDialog(title: string, detail: string): void {
  this.dialog.open(InfoDialogComponent, {
    data: { title, detail },
    panelClass: 'custom-dialog-width'
  });
}
private validateDateAndTime(formValue: any): { isValid: boolean; errorTitle?: string; errorMessage?: string } {
  const datum = formValue.datum;

  if (!datum) {
    return { isValid: false, errorTitle: 'Pflichtfelder fehlen', errorMessage: 'Bitte wählen Sie ein Datum aus.' };
  }

  const selectedDate = datum instanceof Date ? datum : this.dateParserService.parseGermanDate(datum);
  if (!selectedDate) {
    return { isValid: false, errorTitle: 'Ungültiges Datum', errorMessage: 'Bitte verwenden Sie das Format TT.MM.JJJJ.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateOnly = new Date(selectedDate);
  selectedDateOnly.setHours(0, 0, 0, 0);

  // ✅ FIX: Block future dates for new entries
  if (this.isCreatingNew && selectedDateOnly > today) {
    return {
      isValid: false,
      errorTitle: 'Ungültiges Datum',
      errorMessage: 'Das Datum darf nicht in der Zukunft liegen.'
    };
  }

  const { anmeldezeitStunde, anmeldezeitMinuten, abmeldezeitStunde, abmeldezeitMinuten } = formValue;

  // ✅ FIX: If selected date is TODAY, both login and logoff hours must be ≤ current hour
  const isToday = selectedDateOnly.getTime() === today.getTime();
  if (this.isCreatingNew && isToday) {
    const now = new Date();
    const currentHour = now.getHours();

    if (anmeldezeitStunde > currentHour) {
      return {
        isValid: false,
        errorTitle: 'Ungültige Anmeldezeit',
        errorMessage: `Die Anmeldezeit (Stunde) darf die aktuelle Stunde (${currentHour}:xx) nicht überschreiten.`
      };
    }

    if (abmeldezeitStunde > currentHour) {
      return {
        isValid: false,
        errorTitle: 'Ungültige Abmeldezeit',
        errorMessage: `Die Abmeldezeit (Stunde) darf die aktuelle Stunde (${currentHour}:xx) nicht überschreiten.`
      };
    }
  }

  // Logoff must be after login
  const startMinutes = anmeldezeitStunde * 60 + anmeldezeitMinuten;
  const endMinutes = abmeldezeitStunde * 60 + abmeldezeitMinuten;

  if (endMinutes <= startMinutes) {
    return {
      isValid: false,
      errorTitle: 'Ungültige Zeitangaben',
      errorMessage: 'Die Abmeldezeit muss nach der Anmeldezeit liegen.'
    };
  }

  // Hour 24 rule
  if ((anmeldezeitStunde === 24 && anmeldezeitMinuten !== 0) ||
      (abmeldezeitStunde === 24 && abmeldezeitMinuten !== 0)) {
    return {
      isValid: false,
      errorTitle: 'Ungültige Zeitangaben',
      errorMessage: 'Bei 24 Stunden müssen die Minuten 0 sein.'
    };
  }

  return { isValid: true };
}
  debugTreeState(action: string) {
    this.treeControl.dataNodes.forEach((node, index) => {
      if (this.treeControl.isExpanded(node)) {
        console.log(`Expanded: Level ${node.level} - "${node.name}"`);
      }
    });
    console.log('========================');
  }

  private getNodeId(node: FlatNode): string {
    const baseId = `${node.level}-${node.name}-${node.expandable}`;

    if (node.level === 1) {
      const parentNode = this.findParentNode(node);
      if (parentNode) {
        return `${baseId}-parent:${parentNode.name}`;
      }
    }

    return baseId;
  }

  private findParentNode(node: FlatNode): FlatNode | null {
    const nodeIndex = this.treeControl.dataNodes.indexOf(node);
    if (nodeIndex <= 0) return null;
    for (let i = nodeIndex - 1; i >= 0; i--) {
      const potentialParent = this.treeControl.dataNodes[i];
      if (potentialParent.level < node.level) {
        return potentialParent;
      }
    }

    return null;
  }

  onDropdownOpened() {
    console.log('Dropdown OPENED - isEditing:', this.isEditing);
  }

  onDropdownClosed() {
    console.log('Dropdown CLOSED - isEditing:', this.isEditing);
    if (this.isEditing) {
      this.isEditing = true;
      this.cdr.detectChanges();
    }
  }

  getDropdownState(select: any): string {
    if (!select) return 'unknown';
    return `disabled: ${select.disabled}, panelOpen: ${select.panelOpen}`;
  }

private updateFormControlsState() {
  const zeittypControl = this.stempelzeitForm.get('zeittyp');
  const datumControl = this.stempelzeitForm.get('datum');

  if (this.isEditing) {
    zeittypControl?.enable();
  } else {
    zeittypControl?.disable();
  }

  // Datum is ONLY editable when creating a new entry
  if (this.isCreatingNew) {
    datumControl?.enable();
  } else {
    datumControl?.disable();
  }

  this.cdr.detectChanges();
}
  addTimeEntryFromHeader() {
    console.log('=== START addTimeEntryFromHeader ===');
    this.debugTreeState('Before adding new entry from header');

    if (this.isCreatingNew && this.newNode) {
      this.cancelNewEntrySilently();
    }

    const currentTime = new Date();
    const currentDateString = currentTime.toLocaleDateString('de-DE');

    const tempNewNode: FlatNode = {
      expandable: false,
      name: 'Neuer Eintrag',
      level: 2,
      hasNotification: false,
      formData: {
        datum: currentDateString,
        zeittyp: 'ARBEITSZEIT',
        anmeldezeit: { stunde: 0, minuten: 0 },
        abmeldezeit: { stunde: 0, minuten: 0 },
        anmerkung: 'Neuer Eintrag'
      },
      timeEntry: {
        id: `temp-${Date.now()}`,
        login: currentTime.toISOString(),
        logoff: currentTime.toISOString(),
        zeitTyp: ApiZeitTyp.ARBEITSZEIT,
        poKorrektur: false
      }
    };

    this.selectedNode = tempNewNode;
    this.newNode = tempNewNode;
    this.isCreatingNew = true;
    this.isEditing = true;

    this.populateForm(tempNewNode.formData);

    console.log('New entry form opened from header with current date:', currentDateString);
    console.log('=== END addTimeEntryFromHeader ===');
  }
  private findOrCreateMonthNode(monthYear: string): StempelzeitNode {
    let monthNode = this.dataSource.data.find(node => node.name === monthYear);

    if (!monthNode) {
      const [month, year] = monthYear.split(' ');
      monthNode = {
        name: monthYear,
        hasNotification: false,
        children: []
      };

      this.dataSource.data = [...this.dataSource.data, monthNode];

      this.dataSource.data.sort((a, b) => {
        const dateA = this.parseMonthYearString(a.name);
        const dateB = this.parseMonthYearString(b.name);
        return dateA.getTime() - dateB.getTime();
      });

      console.log('Created new month node:', monthYear);
    }

    return monthNode;
  }

  private findOrCreateDayNode(monthNode: StempelzeitNode, dayKey: string, date: Date): StempelzeitNode {
    if (!monthNode.children) {
      monthNode.children = [];
    }

    let dayNode = monthNode.children.find(node => node.name === dayKey);

    if (!dayNode) {
      dayNode = {
        name: dayKey,
        hasNotification: false,
        children: []
      };

      monthNode.children.push(dayNode);
      monthNode.children.sort((a, b) => {
        const dateA = new Date(a.name.split('.').reverse().join('-'));
        const dateB = new Date(b.name.split('.').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });

      console.log('Created new day node:', dayKey);
    }

    return dayNode;
  }

  private expandParentNodesForNewEntry(monthYear: string, dayKey: string) {
    console.log('Expanding parent nodes for:', { monthYear, dayKey });

    const flatNodes = this.treeControl.dataNodes;

    // Expand month node
    const monthNode = flatNodes.find(node =>
      node.level === 0 && node.name === monthYear
    );
    if (monthNode) {
      if (!this.treeControl.isExpanded(monthNode)) {
        this.treeControl.expand(monthNode);
        console.log('Expanded month node:', monthYear);
      }
    }

    const dayNode = flatNodes.find(node =>
      node.level === 1 && node.name === dayKey
    );
    if (dayNode) {
      if (!this.treeControl.isExpanded(dayNode)) {
        this.treeControl.expand(dayNode);
        console.log('Expanded day node:', dayKey);
      }
    }
  }

  getHour(timeType: 'anmeldezeit' | 'abmeldezeit'): number {
    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
    return this.stempelzeitForm.get(controlName)?.value || 0;
  }

  getMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): number {
    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
    return this.stempelzeitForm.get(controlName)?.value || 0;
  }
increaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
  if (!this.isEditing) return;
  const hourControlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
  const minuteControlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
  const currentHour = this.getHour(timeType);
  const newHour = currentHour >= 24 ? 0 : currentHour + 1;
  this.stempelzeitForm.get(hourControlName)?.setValue(newHour);
  if (newHour === 24) {
    this.stempelzeitForm.get(minuteControlName)?.setValue(0);
  }
  this.stempelzeitForm.markAsDirty();
}

decreaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
  if (!this.isEditing) return;
  const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
  const currentHour = this.getHour(timeType);
  const newHour = currentHour <= 0 ? 24 : currentHour - 1;
  this.stempelzeitForm.get(controlName)?.setValue(newHour);
  this.stempelzeitForm.markAsDirty();
}

increaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
  if (!this.isEditing) return;
  const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
  const currentMinute = this.getMinute(timeType);
  const newMinute = currentMinute >= 59 ? 0 : currentMinute + 1;
  this.stempelzeitForm.get(controlName)?.setValue(newMinute);
  this.stempelzeitForm.markAsDirty();
}

decreaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
  if (!this.isEditing) return;
  const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
  const currentMinute = this.getMinute(timeType);
  const newMinute = currentMinute <= 0 ? 59 : currentMinute - 1;
  this.stempelzeitForm.get(controlName)?.setValue(newMinute);
  this.stempelzeitForm.markAsDirty();
}

  validateTime(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    const hourControlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
    const minuteControlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';

    const hourControl = this.stempelzeitForm.get(hourControlName);
    const minuteControl = this.stempelzeitForm.get(minuteControlName);

    let hourValue = hourControl?.value || 0;
    let minuteValue = minuteControl?.value || 0;

    if (hourValue < 0) hourValue = 0;
    if (hourValue > 24) hourValue = 24;

    if (minuteValue < 0) minuteValue = 0;
    if (minuteValue > 59) minuteValue = 59;
    if (hourValue === 24 && minuteValue !== 0) {
      minuteValue = 0;
    }

    hourControl?.setValue(hourValue);
    minuteControl?.setValue(minuteValue);

    this.stempelzeitForm.markAsDirty();
  }
  onZeittypChange(event: any) {
    if (this.isEditing && this.selectedNode) {
      this.stempelzeitForm.markAsDirty();

      if (this.selectedNode.formData) {
        this.selectedNode.formData.zeittyp = event.value;
      }
      if (this.selectedNode.timeEntry) {
        this.selectedNode.timeEntry.zeitTyp = event.value;
      }

      this.isEditing = true;
      this.cdr.detectChanges();
    }
  }
private validateTimeEntryOverlap(formValue: any): { isValid: boolean; errorMessage?: string } {
  const { datum, anmeldezeitStunde, anmeldezeitMinuten, abmeldezeitStunde, abmeldezeitMinuten } = formValue;

  if (!datum) {
    return { isValid: false, errorMessage: 'Datum ist erforderlich' };
  }

  const selectedDate = datum instanceof Date
    ? datum
    : this.dateParserService.parseGermanDate(datum);

  if (!selectedDate) {
    return { isValid: false, errorMessage: 'Ungültiges Datumformat.' };
  }

  const startTime = new Date(selectedDate);
  startTime.setHours(anmeldezeitStunde, anmeldezeitMinuten, 0, 0);
  const endTime = new Date(selectedDate);
  endTime.setHours(abmeldezeitStunde, abmeldezeitMinuten, 0, 0);

  const overlaps = this.checkForTimeOverlaps(startTime, endTime, this.selectedNode?.timeEntry?.id);

  if (overlaps.hasOverlap) {
    return { isValid: false, errorMessage: `Zeitüberschneidung mit bestehendem Eintrag: ${overlaps.overlappingEntry}` };
  }

  return { isValid: true };
}

  private checkForTimeOverlaps(
    newStart: Date,
    newEnd: Date,
    excludeEntryId?: string
  ): { hasOverlap: boolean; overlappingEntry?: string } {

    const allTimeEntries: { entry: ApiStempelzeit; node: StempelzeitNode }[] = [];

    const collectTimeEntries = (nodes: StempelzeitNode[]) => {
      nodes.forEach(node => {
        if (node.timeEntry && node.formData) {
          allTimeEntries.push({ entry: node.timeEntry, node });
        }
        if (node.children) {
          collectTimeEntries(node.children);
        }
      });
    };

    collectTimeEntries(this.dataSource.data);

    for (const { entry, node } of allTimeEntries) {
      if (excludeEntryId && entry.id === excludeEntryId) {
        continue;
      }

      const existingStart = new Date(entry.login!);
      const existingEnd = new Date(entry.logoff!);

      const isSameDay =
        existingStart.toDateString() === newStart.toDateString();

      if (!isSameDay) {
        continue;
      }

      const hasOverlap =
        (newStart < existingEnd && newEnd > existingStart);

      if (hasOverlap) {
        const overlappingTime = `${this.formatTime(existingStart)} - ${this.formatTime(existingEnd)}`;
        return {
          hasOverlap: true,
          overlappingEntry: overlappingTime
        };
      }
    }

    return { hasOverlap: false };
  }

  getHeaderTitle(): string {
    if (!this.selectedNode) return 'Stempelzeit';

    if (this.selectedNode.level === 0) {
      return this.selectedNode.name;
    } else if (this.selectedNode.level === 1) {
      return this.convertToLongDayFormat(this.selectedNode.name);
    } else if (this.selectedNode.level === 2 && this.selectedNode.formData) {
      return 'Stempelzeit';
    }

    return 'Stempelzeit';
  }
  private convertToLongDayFormat(shortFormat: string): string {
    try {
      const parts = shortFormat.split(' ');
      if (parts.length < 3) return shortFormat;

      const dayNumber = parseInt(parts[1].replace('.', ''), 10);
      const monthName = parts[2];

      const months: { [key: string]: number } = {
        'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
        'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
      };

      const month = months[monthName] || 0;
      const year = new Date().getFullYear();

      const date = new Date(year, month, dayNumber);

      const weekday = date.toLocaleDateString('de-DE', { weekday: 'long' });
      return `${weekday} ${dayNumber}. ${monthName}`;
    } catch (error) {
      console.error('Error converting day format:', error);
      return shortFormat;
    }
  }
  getEmptyStateTitle(): string {
    if (!this.selectedNode) return 'Kein Eintrag ausgewählt';

    if (this.selectedNode.level === 0) {
      return this.selectedNode.name;
    } else if (this.selectedNode.level === 1) {
      return this.selectedNode.name;
    }

    return 'Kein Eintrag ausgewählt';
  }

  getEmptyStateDescription(): string {
    if (!this.selectedNode) return 'Wählen Sie einen Eintrag aus der Liste aus, um Details anzuzeigen.';

    if (this.selectedNode.level === 0) {
      return 'Wählen Sie einen Tag aus, um Zeiteinträge zu sehen.';
    } else if (this.selectedNode.level === 1) {
      return 'Wählen Sie einen Zeiteintrag aus, um Details anzuzeigen.';
    }

    return 'Wählen Sie einen Eintrag aus der Liste aus, um Details anzuzeigen.';
  }
  getSelectedNodeDisplayName(): string {
    if (!this.selectedNode) return '';

    if (this.selectedNode.level === 0) {
      return this.selectedNode.name;
    } else if (this.selectedNode.level === 1) {
      return this.convertToLongDayFormat(this.selectedNode.name);
    }

    return '';
  }
  private formatDayName(date: Date): string {
    const weekdays: { [key: number]: string } = {
      0: 'So', 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa'
    };

    const weekday = weekdays[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('de-DE', { month: 'long' });

    return `${weekday} ${day}. ${month}`;
  }
  formatTimeValue(value:number):string{
    return value<10?`0${value}`:`${value}`;
  }
private autoExpandLatestMonthNodes(): void {
  setTimeout(() => {
    const allNodes = this.treeControl.dataNodes;
    const monthNodes = allNodes.filter(node => node.level === 0);

    if (!monthNodes.length) return;

    monthNodes.forEach(node => this.treeControl.expand(node));

    const latestMonthNode = monthNodes[monthNodes.length - 1];
    const latestMonthIndex = allNodes.indexOf(latestMonthNode);

    const dayNodesOfLatestMonth: FlatNode[] = [];
    for (let i = latestMonthIndex + 1; i < allNodes.length; i++) {
      const node = allNodes[i];
      if (node.level === 0) break;
      if (node.level === 1) dayNodesOfLatestMonth.push(node);
    }

    if (!dayNodesOfLatestMonth.length) return;

    const lastDayNode = dayNodesOfLatestMonth[dayNodesOfLatestMonth.length - 1];
    this.treeControl.expand(lastDayNode);

    const lastDayIndex = allNodes.indexOf(lastDayNode);
    for (let i = lastDayIndex + 1; i < allNodes.length; i++) {
      const node = allNodes[i];
      if (node.level <= 1) break;
      if (node.level === 2 && node.formData) {
        this.selectedNode = node;
        this.populateForm(node.formData);
        this.isEditing = false;
        this.isCreatingNew = false;
        this.updateFormControlsState();
        break;
      }
    }
  }, 0);
}
onTimeInput(field: string, event: Event, max: number): void {
  const input = event.target as HTMLInputElement;

  input.value = input.value.replace(/[^0-9]/g, '');

  if (input.value === '') {
    this.stempelzeitForm.get(field)?.patchValue(0, { emitEvent: true });
    this.stempelzeitForm.markAsDirty();
    return;
  }

  let num = parseInt(input.value, 10);

  if (num > max) {
    const lastDigit = parseInt(input.value[input.value.length - 1], 10);
    num = lastDigit;
    input.value = String(num);
  }

  this.stempelzeitForm.get(field)?.patchValue(num, { emitEvent: true });
  this.stempelzeitForm.markAsDirty();
  this.stempelzeitForm.updateValueAndValidity();
}
dateFilter = (date: Date | null): boolean => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};
}
