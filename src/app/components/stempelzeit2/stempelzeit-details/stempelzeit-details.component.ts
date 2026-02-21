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
import { StempelzeitNode, FlatNode, FormData, TimeEntry, TimeData } from '../../../models/stempelzeit-details';
import { DummyService} from '../../../services/dummy.service';
import { ApiStempelzeit } from '../../../models-2/ApiStempelzeit';
import { ApiStempelzeitMarker } from '../../../models-2/ApiStempelzeitMarker';
import { ApiZeitTyp } from '../../../models-2/ApiZeitTyp';
import { ApiAbschlussInfo } from '../../../models-2/ApiAbschlussInfo';
import { forkJoin } from 'rxjs';
import { ApiProdukt } from '../../../models-2/ApiProdukt';
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
    ConfirmationDialogComponent],
})
export class StempelzeitDetailsComponent implements OnInit {
  ZeittypDrop = ["Überstunden", "Arbeitszeit", "Remotezeit", "Pause"];
  private clickTimeout: any = null;
  private lastClickedNode: FlatNode | null = null;

  // Tree control
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );


  private transformer = (node: StempelzeitNode, level: number): FlatNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      hasNotification: node.hasNotification || false,
      formData: node.formData,
      timeEntry: node.timeEntry
    };
  };

  // Tree flattener instance
  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

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


  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dummyService: DummyService

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
    products: this.dummyService.getPersonProdukte(
      id,
      'KORREKTUR',
      startDate,
      endDate
    )
  }).subscribe({
   next: (results) => {
  this.abschlussInfo = results.abschlussInfo;
  this.produktOptions = results.products;

 const timeEntries: TimeEntry[] = results.stempelzeiten.map(s => ({
  id: s.id ?? '',
  version: 1,
  deleted: false,
  login: s.login!,
  logoff: s.logoff!,
  zeitTyp: s.zeitTyp!,
  poKorrektur: s.poKorrektur ?? false,
  marker: [],
  eintragungsart: 'NORMAL',
  anmerkung: s.anmerkung ?? ''
}));

  const treeData = this.transformJsonToTree(timeEntries);
  this.dataSource.data = treeData;
  this.isLoading = false;
},
    error: (error) => {
      console.error('Error loading data:', error);
      this.isLoading = false;
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
      console.log('person from navigation state:',person);
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
          this.personName= `${person.vorname} ${person.nachname}`;
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
              const login = new Date(child.timeEntry.login);
              const logoff = new Date(child.timeEntry.logoff);
              const duration = (logoff.getTime() - login.getTime()) / (1000 * 60); // minutes
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
    const zeitTypMap: { [key: string]: string } = {
      'ARBEITSZEIT': 'Arbeitszeit',
      'REMOTEZEIT': 'Remotezeit',
      'PAUSE': 'Pause',
      'ÜBERSTUNDEN': 'Überstunden'
    };

    return zeitTypMap[zeitTyp] || zeitTyp;
  }

  transformJsonToTree(timeEntries: TimeEntry[]): StempelzeitNode[] {
    const groupedByMonth: { [key: string]: TimeEntry[] } = {};

    timeEntries.forEach(entry => {
      const loginDate = new Date(entry.login);
      const monthYear = this.getMonthYearString(loginDate);

      if (!groupedByMonth[monthYear]) {
        groupedByMonth[monthYear] = [];
      }
      groupedByMonth[monthYear].push(entry);
    });

    const treeData: StempelzeitNode[] = [];

    Object.keys(groupedByMonth).sort((a, b) => {
      const dateA = this.parseMonthYearString(a);
      const dateB = this.parseMonthYearString(b);
      return dateA.getTime() - dateB.getTime();
    }).forEach(monthYear => {
      const monthEntries = groupedByMonth[monthYear];
      const [month, year] = monthYear.split(' ');

      const monthNode: StempelzeitNode = {
        name: `${month} ${year}`,
        hasNotification: this.hasNotifications(monthEntries),
        children: []
      };

      const groupedByDay: { [key: string]: TimeEntry[] } = {};

      monthEntries.forEach(entry => {
        const loginDate = new Date(entry.login);
        const dayKey = this.formatDayName(loginDate);

        if (!groupedByDay[dayKey]) {
          groupedByDay[dayKey] = [];
        }
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

        dayEntries.forEach((entry, index) => {
          const loginTime = new Date(entry.login);
          const logoffTime = new Date(entry.logoff);

          const entryNode: StempelzeitNode = {
            name: `${this.formatTime(loginTime)} - ${this.formatTime(logoffTime)}`,
            date: loginTime.toLocaleDateString('de-DE'),
            hasNotification: entry.marker && entry.marker.length > 0,
            timeEntry: entry,
            formData: {
              datum: loginTime.toLocaleDateString('de-DE'),
              zeittyp: entry.zeitTyp,
              anmeldezeit: {
                stunde: loginTime.getHours(),
                minuten: loginTime.getMinutes()
              },
              abmeldezeit: {
                stunde: logoffTime.getHours(),
                minuten: logoffTime.getMinutes()
              },
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
      return new Date(); // Fallback
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

  private hasNotifications(entries: TimeEntry[]): boolean {
    return entries.some(entry => entry.marker && entry.marker.length > 0);
  }

  private generateAnmerkung(entry: TimeEntry): string {
    const parts: string[] = [];

    if (entry.poKorrektur) {
      parts.push('PO Korrektur');
    }

    if (entry.marker && entry.marker.length > 0) {
      parts.push(`Marker: ${entry.marker.join(', ')}`);
    }

    if (entry.eintragungsart && entry.eintragungsart !== 'NORMAL') {
      parts.push(`Eintragungsart: ${entry.eintragungsart}`);
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
  //double click handler
  onNodeDoubleClick(node: FlatNode) {
    // Clear the single click timeout
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
      // Time entry node - has form data, so select and show details
      this.selectedNode = node;
      this.populateForm(node.formData);
      this.isEditing = false;
      this.isCreatingNew = false;
      this.updateFormControlsState();
    } else if (node.expandable) {
      this.selectedNode = node;
      // this.stempelzeitForm.reset();
      // this.isEditing = false;
      // this.isCreatingNew = false;
      // this.updateFormControlsState();
    } else {
      // Non-expandable node without form data
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

    // For non-expandable nodes, double click does nothing special
    // but we still select the node (same as single click)
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
      // Enable zeittyp control when editing
      if (this.isEditing || this.isCreatingNew) {
        this.stempelzeitForm.get('zeittyp')?.enable();
      } else {
        this.stempelzeitForm.get('zeittyp')?.disable();
      }
      if (this.isCreatingNew) {
        this.stempelzeitForm.get('datum')?.enable();
      } else {
        this.stempelzeitForm.get('datum')?.disable();
      }

      this.stempelzeitForm.patchValue({
        datum: formData.datum,
        zeittyp: formData.zeittyp,
        anmeldezeitStunde: formData.anmeldezeit.stunde,
        anmeldezeitMinuten: formData.anmeldezeit.minuten,
        abmeldezeitStunde: formData.abmeldezeit.stunde,
        abmeldezeitMinuten: formData.abmeldezeit.minuten,
        anmerkung: formData.anmerkung
      });

      this.stempelzeitForm.markAsPristine();
    } else {
      this.stempelzeitForm.reset();
    }
  }

 saveForm() {
  const datumControl = this.stempelzeitForm.get('datum');
  const wasDatumDisabled = datumControl?.disabled;

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

  const formValue = this.stempelzeitForm.value;
  const datumValue = formValue.datum;

  if (!datumValue || datumValue.trim() === '') {
    if (wasDatumDisabled) datumControl?.disable();
    this.snackBar.open('Bitte geben Sie ein Datum ein', 'Schließen', { duration: 3000, verticalPosition: 'top' });
    return;
  }

  const validationResult = this.validateTimeEntryOverlap(formValue);
  if (!validationResult.isValid) {
    if (wasDatumDisabled) datumControl?.disable();
    this.snackBar.open(validationResult.errorMessage || 'Ungültige Zeitangaben', 'Schließen', { duration: 5000, verticalPosition: 'top' });
    return;
  }

  // update local formData
  if (this.selectedNode.formData) {
    this.selectedNode.formData.datum         = datumValue;
    this.selectedNode.formData.zeittyp       = formValue.zeittyp;
    this.selectedNode.formData.anmeldezeit.stunde  = formValue.anmeldezeitStunde;
    this.selectedNode.formData.anmeldezeit.minuten = formValue.anmeldezeitMinuten;
    this.selectedNode.formData.abmeldezeit.stunde  = formValue.abmeldezeitStunde;
    this.selectedNode.formData.abmeldezeit.minuten = formValue.abmeldezeitMinuten;
    this.selectedNode.formData.anmerkung     = formValue.anmerkung;
  }

  this.selectedNode.name = `${this.formatTimeFromNumbers(formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten)} - ${this.formatTimeFromNumbers(formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten)}`;

  if (this.selectedNode.timeEntry) {
    const selectedDate = this.parseGermanDate(datumValue);
    if (selectedDate) {
      const loginTime = new Date(selectedDate);
      loginTime.setHours(formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten, 0, 0);
      const logoffTime = new Date(selectedDate);
      logoffTime.setHours(formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten, 0, 0);
      this.selectedNode.timeEntry.login  = loginTime.toISOString();
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
      this.snackBar.open('Änderungen gespeichert!', 'Schließen', { duration: 3000, verticalPosition: 'top' });
      this.isEditing     = false;
      this.isCreatingNew = false;
      this.dataSource.data = [...this.dataSource.data];
      this.previousExpandedState.forEach(n => this.treeControl.expand(n));
      this.previousExpandedState.clear();
      this.stempelzeitForm.markAsPristine();
    },
    error: () => {
      if (wasDatumDisabled) datumControl?.disable();
      this.snackBar.open('Fehler beim Speichern', 'Schließen', { duration: 3000, verticalPosition: 'top' });
    }
  });
}




  private updateTreeNodeData(node: FlatNode, newDate: string, newZeittyp: string) {
    const updateNodeInTree = (nodes: StempelzeitNode[]): boolean => {
      for (const treeNode of nodes) {
        if (treeNode.children) {
          for (const childNode of treeNode.children) {
            if (childNode.timeEntry?.id === node.timeEntry?.id) {
              // Update the tree node data
              if (childNode.formData) {
                childNode.formData.datum = newDate;
                childNode.formData.zeittyp = newZeittyp;
              }

              // Update the node name in the tree structure
              const newTimeRange = `${this.formatTimeFromNumbers(
                node.formData?.anmeldezeit.stunde || 0,
                node.formData?.anmeldezeit.minuten || 0
              )} - ${this.formatTimeFromNumbers(
                node.formData?.abmeldezeit.stunde || 0,
                node.formData?.abmeldezeit.minuten || 0
              )}`;

              childNode.name = newTimeRange;
              return true;
            }
          }
          if (updateNodeInTree(treeNode.children)) {
            return true;
          }
        }
      }
      return false;
    };

    updateNodeInTree(this.dataSource.data);
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

    if (errors.length > 0) {
      const errorMessage = this.formatValidationErrors(errors);
      this.snackBar.open(errorMessage, 'Schließen', {
        duration: 5000,
        verticalPosition: 'top'
      });
    } else {
      this.snackBar.open('Bitte füllen Sie alle erforderlichen Felder aus', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top'
      });
    }
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

  // Helper to get field display names
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

  // Format errors for display
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
    console.log('=== START cancelNewEntrySilently ===');
    this.debugTreeState('Before silently cancelling new entry');

    if (this.newNode) {

      this.saveExpandedState();
      console.log('Saved expanded state before cancellation:', this.expandedNodesSet.size);

      const removeNewNode = (nodes: StempelzeitNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          const treeNode = nodes[i];
          if (treeNode.children) {
            const index = treeNode.children.findIndex(child =>
              child.timeEntry?.id === this.newNode!.timeEntry?.id
            );
            if (index > -1) {
              treeNode.children.splice(index, 1);
              console.log('Removed new node from children');
              return true;
            }
            if (removeNewNode(treeNode.children)) {
              return true;
            }
          }
        }
        return false;
      };

      removeNewNode(this.dataSource.data);


      this.dataSource.data = [...this.dataSource.data];
      console.log('Updated dataSource after removal');


      this.restoreExpandedState();
      console.log('Restored expanded state after cancellation');
    }

    this.isCreatingNew = false;
    this.isEditing = false;
    this.newNode = null;
    this.selectedNode = null;
    this.stempelzeitForm.reset();

    this.debugTreeState('After silently cancelling new entry');
    console.log('=== END cancelNewEntrySilently ===');
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

    console.log('=== START addTimeEntry ===');
    this.debugTreeState('Before adding new entry');

    if (this.isCreatingNew && this.newNode) {
      this.cancelNewEntrySilently();
    }

    if (node.level === 1) {
      this.saveExpandedState();
      console.log('Saved expanded state:', this.expandedNodesSet.size);

      const findAndAddEntry = (nodes: StempelzeitNode[]): boolean => {
        for (const treeNode of nodes) {
          if (treeNode.name === node.name && treeNode.children) {
            const currentTime = new Date();
            const newTimeEntry: TimeEntry = {
              id: `new-${Date.now()}`,
              version: 1,
              deleted: false,
              login: currentTime.toISOString(),
              logoff: currentTime.toISOString(),
              zeitTyp: 'ARBEITSZEIT',
              poKorrektur: false,
              marker: [],
              eintragungsart: 'NORMAL'
            };

            const newEntryNode: StempelzeitNode = {
              name: `00:00 - 00:00`,
              date: currentTime.toLocaleDateString('de-DE'),
              hasNotification: false,
              timeEntry: newTimeEntry,
              formData: {
                datum: currentTime.toLocaleDateString('de-DE'),
                zeittyp: 'ARBEITSZEIT',
                anmeldezeit: { stunde: 0, minuten: 0 },
                abmeldezeit: { stunde: 0, minuten: 0 },
                anmerkung: 'Neuer Eintrag'
              }
            };

            treeNode.children.push(newEntryNode);
            console.log('Added new entry to children, count:', treeNode.children.length);

            this.dataSource.data = [...this.dataSource.data];
            console.log('Updated dataSource');

            this.debugTreeState('After dataSource update, before restore');

            this.restoreExpandedState();
            console.log('Restored expanded state');

            this.debugTreeState('After restoreExpandedState');

            if (!this.treeControl.isExpanded(node)) {
              this.treeControl.expand(node);
              console.log('Forced expansion of parent node');
            }

            const newFlatNode = this.findNewFlatNode(newEntryNode);
            if (newFlatNode) {
              this.newNode = newFlatNode;
              this.selectedNode = newFlatNode;
              this.isCreatingNew = true;
              this.isEditing = true;
              this.populateForm(newFlatNode.formData);
              console.log('New node created and selected');
            }

            this.debugTreeState('Final state after addTimeEntry');
            return true;
          }
          if (treeNode.children && findAndAddEntry(treeNode.children)) return true;
        }
        return false;
      };

      findAndAddEntry(this.dataSource.data);
    }
    console.log('=== END addTimeEntry ===');
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

  const formValue = this.stempelzeitForm.value;

  const validationResult = this.validateTimeEntryOverlap(formValue);
  if (!validationResult.isValid) {
    this.snackBar.open(validationResult.errorMessage || 'Ungültige Zeitangaben', 'Schließen', { duration: 5000, verticalPosition: 'top' });
    return;
  }

  const selectedDate = this.parseGermanDate(formValue.datum);
  if (!selectedDate) {
    this.snackBar.open('Ungültiges Datumformat', 'Schließen', { duration: 3000, verticalPosition: 'top' });
    return;
  }

  const selectedMonthYear = this.getMonthYearString(selectedDate);
  const selectedDayKey = selectedDate.toLocaleDateString('de-DE', {
    weekday: 'short', day: '2-digit', month: 'long'
  }).replace(',', ' ');

  const loginTime = new Date(selectedDate);
  loginTime.setHours(formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten, 0, 0);
  const logoffTime = new Date(selectedDate);
  logoffTime.setHours(formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten, 0, 0);

  const newTimeEntry: TimeEntry = {
    id:             `new-${Date.now()}`,
    version:1,
    deleted:false,
    login:          loginTime.toISOString(),
    logoff:         logoffTime.toISOString(),
    zeitTyp:        formValue.zeittyp,
    poKorrektur:    false,
    marker:         [],
    eintragungsart: 'NORMAL'
  };

  const newEntryNode: StempelzeitNode = {
    name:     `${this.formatTime(loginTime)} - ${this.formatTime(logoffTime)}`,
    date:     selectedDate.toLocaleDateString('de-DE'),
    hasNotification: false,
    timeEntry: newTimeEntry,
    formData: {
      datum:        selectedDate.toLocaleDateString('de-DE'),
      zeittyp:      formValue.zeittyp,
      anmeldezeit:  { stunde: formValue.anmeldezeitStunde,  minuten: formValue.anmeldezeitMinuten },
      abmeldezeit:  { stunde: formValue.abmeldezeitStunde,  minuten: formValue.abmeldezeitMinuten },
      anmerkung:    formValue.anmerkung
    }
  };

  const monthNode = this.findOrCreateMonthNode(selectedMonthYear);
  const dayNode   = this.findOrCreateDayNode(monthNode, selectedDayKey, selectedDate);
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
      this.snackBar.open('Neuer Eintrag gespeichert!', 'Schließen', { duration: 3000, verticalPosition: 'top' });
      this.isCreatingNew = false;
      this.isEditing     = false;
      this.newNode       = null;
      this.stempelzeitForm.markAsPristine();
    },
    error: () => this.snackBar.open('Fehler beim Speichern', 'Schließen', { duration: 3000, verticalPosition: 'top' })
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

    // Parse German date format (DD.MM.YYYY)
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
    if (this.newNode) {
      const removeNewNode = (nodes: StempelzeitNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          const treeNode = nodes[i];
          if (treeNode.children) {
            const index = treeNode.children.findIndex(child =>
              child.timeEntry?.id === this.newNode!.timeEntry?.id
            );
            if (index > -1) {
              treeNode.children.splice(index, 1);
              return true;
            }
            if (removeNewNode(treeNode.children)) {
              return true;
            }
          }
        }
        return false;
      };

      removeNewNode(this.dataSource.data);

      this.dataSource.data = [...this.dataSource.data];
      this.previousExpandedState.forEach(expandedNode => {
        this.treeControl.expand(expandedNode);
      });
      this.previousExpandedState.clear();

      this.snackBar.open('Eintrag verworfen', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top'
      });
    }

    this.isCreatingNew = false;
    this.isEditing = false;
    this.newNode = null;
    this.selectedNode = null;
    this.stempelzeitForm.reset();
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

      if (!confirmed) {
        console.log('Delete operation cancelled by user');
        return;
      }

      this.previousExpandedState = new Set(this.treeControl.expansionModel.selected);

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
            if (removeNode(treeNode.children)) {
              return true;
            }
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
      this.previousExpandedState.forEach(n => this.treeControl.expand(n));
      this.previousExpandedState.clear();
      this.snackBar.open('Eintrag gelöscht!', 'Schließen', { duration: 3000, verticalPosition: 'top' });
      this.selectedNode = null;
      this.isEditing = false;
      this.stempelzeitForm.reset();
    },
    error: () => this.snackBar.open('Fehler beim Löschen', 'Schließen', { duration: 3000, verticalPosition: 'top' })
  });
}
    } else if (this.isCreatingNew) {
      this.cancelNewEntry();
    }
  }

  private async showDeleteConfirmation(entryName: string, entryDate?: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      panelClass: 'confirmation-dialog-panel',
      data: {
        title: 'Löschen eines Verbraucher',
        message: `Wollen Sie den Verbraucher "${entryName}"${entryDate ? ` vom ${entryDate}` : ''} wirklich löschen?`,
        confirmText: 'Ja',
        cancelText: 'Nein'
      }
    });


    const result = await dialogRef.afterClosed().toPromise();
    return result === true;
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

    // Look backwards for the parent node (level should be less than current node)
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
    // Keep edit mode active when dropdown closes
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

    if (this.isEditing) {
      zeittypControl?.enable();
    } else {
      zeittypControl?.disable();
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
        version: 1,
        deleted: false,
        login: currentTime.toISOString(),
        logoff: currentTime.toISOString(),
        zeitTyp: 'ARBEITSZEIT',
        poKorrektur: false,
        marker: [],
        eintragungsart: 'NORMAL'
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

  // Hour manipulation methods
  increaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing) return;

    const hourControlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
    const minuteControlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';

    const currentHour = this.getHour(timeType);

    if (currentHour < 24) {
      const newHour = currentHour + 1;
      this.stempelzeitForm.get(hourControlName)?.setValue(newHour);

      if (newHour === 24) {
        this.stempelzeitForm.get(minuteControlName)?.setValue(0);
      }

      this.stempelzeitForm.markAsDirty();
    }
  }

  decreaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing) return;

    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
    const currentHour = this.getHour(timeType);

    if (currentHour > 0) {
      this.stempelzeitForm.get(controlName)?.setValue(currentHour - 1);
      this.stempelzeitForm.markAsDirty();
    }
  }

  // Minute manipulation methods
  increaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing) return;

    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
    const currentMinute = this.getMinute(timeType);
    const currentHour = this.getHour(timeType);

    if (currentHour === 24) return;

    if (currentMinute < 59) {
      this.stempelzeitForm.get(controlName)?.setValue(currentMinute + 1);
      this.stempelzeitForm.markAsDirty();
    }
  }

  decreaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing) return;

    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
    const currentMinute = this.getMinute(timeType);
    const currentHour = this.getHour(timeType);

    if (currentHour === 24) return;

    if (currentMinute > 0) {
      this.stempelzeitForm.get(controlName)?.setValue(currentMinute - 1);
      this.stempelzeitForm.markAsDirty();
    }
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
    console.log('=== VALIDATE TIME ENTRY OVERLAP ===');
    console.log('Form value for validation:', formValue);

    const {
      datum,
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    if (!datum || typeof datum !== 'string' || datum.trim() === '') {
      console.log('Datum validation failed - missing or empty:', datum);
      return {
        isValid: false,
        errorMessage: 'Datum ist erforderlich'
      };
    }

    if (!this.isTimeValid(formValue)) {
      console.log('Basic time validation failed');
      return {
        isValid: false,
        errorMessage: 'Ungültige Zeitangaben: Abmeldezeit muss nach Anmeldezeit liegen'
      };
    }

    const selectedDate = this.parseGermanDate(datum);
    if (!selectedDate) {
      console.log('Date parsing failed for:', datum);
      return {
        isValid: false,
        errorMessage: 'Ungültiges Datumformat. Bitte verwenden Sie TT.MM.JJJJ'
      };
    }

    const startTime = new Date(selectedDate);
    startTime.setHours(anmeldezeitStunde, anmeldezeitMinuten, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(abmeldezeitStunde, abmeldezeitMinuten, 0, 0);

    console.log('Validating time range:', {
      start: startTime,
      end: endTime,
      selectedDate: selectedDate
    });

    const overlaps = this.checkForTimeOverlaps(
      startTime,
      endTime,
      this.selectedNode?.timeEntry?.id
    );

    if (overlaps.hasOverlap) {
      console.log('Time overlap detected:', overlaps);
      return {
        isValid: false,
        errorMessage: `Zeitüberschneidung mit bestehendem Eintrag: ${overlaps.overlappingEntry}`
      };
    }

    console.log('Validation passed successfully');
    return { isValid: true };
  }

  private checkForTimeOverlaps(
    newStart: Date,
    newEnd: Date,
    excludeEntryId?: string
  ): { hasOverlap: boolean; overlappingEntry?: string } {

    const allTimeEntries: { entry: TimeEntry; node: StempelzeitNode }[] = [];

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

      const existingStart = new Date(entry.login);
      const existingEnd = new Date(entry.logoff);

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
}
