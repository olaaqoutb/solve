// zivildiener-details.component.ts
import { Component, Injectable, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatNestedTreeNode, MatTreeNode, MatTree, MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatTableModule } from '@angular/material/table';
import { CommonModule, Time } from '@angular/common';
import { ZivildienerService } from '../../../services/zivildiener.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetitRestService } from '../../../services/getit-rest.service';
import { ApiStempelzeit } from '../../../models-2/ApiStempelzeit';
import { ApiZeitTyp } from '../../../models-2/ApiZeitTyp';
import { ApiStempelzeitMarker } from '../../../models-2/ApiStempelzeitMarker';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption } from "@angular/material/core";
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StempelzeitService } from '../../../services/stempelzeit.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { TreeNode } from '../../../models/Tree-nood';
import { FormDataStempelzeit } from '../../../models/Form-data-stempelzeit';
// interface TreeNode {
//   name: string;
//   level: number;
//   expandable: boolean;
//   year?: string;
//   sollArbeitszeit?: string;
//   saldo?: string;
//   urlaubstage?: string;
//   urlaub?: string;
//   arbeitszeit?: string;
//   zeitTyp?: string;
//   login?: string;
//   logoff?: string;
//   anmerkung?: string;
//   children?: TreeNode[];
//   stempelzeit?: ApiStempelzeit;
//   formData?: FormData;
// }

@Component({
  selector: 'app-zivildiener-details',
  templateUrl: './zivildiener-details.component.html',
  styleUrls: ['./zivildiener-details.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    MatTreeModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOption,
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  providers: [
    { provide: 'BASE_URL', useValue: 'http://localhost:8080/api' },
    GetitRestService
    , ZivildienerService,
    StempelzeitService
  ]
})
// @Injectable({
//   providedIn: 'root'
// })
export class ZivildienerDetailsComponent implements OnInit {
  timeEntries: ApiStempelzeit[] = [];
  displayedColumns: string[] = ['bezeichnung', "space", 'datum', 'uhrzeit', 'stunden', 'saldo', 'anmerkung'];
  isLoading = true;
  isEditing = false;
  isCreating = false;
  personId: string | null = null;
  allTimeEntries: ApiStempelzeit[] = [];
  selectedTimeEntry: ApiStempelzeit[] = [];
  selectedMonth: string | null = '';
  selectedDayNode: TreeNode | null = null;
  selectedDayEntries: ApiStempelzeit[] = [];
  stempelzeitForm: FormGroup;
  isCreatingNew = false;
  selectedStempelzeitNode: TreeNode | null = null;
  selectedNode: TreeNode | null = null;
  treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;
  dataSource = new MatTreeNestedDataSource<TreeNode>();
  originalFormData: FormDataStempelzeit | undefined;
  // router: any;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dataService: StempelzeitService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,

  ) {
    this.dataSource.data = [];
    this.stempelzeitForm = this.createForm();
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

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.personId = params.get('id');
      if (this.personId) {
        this.loadData(this.personId);
      }
    });
  }
  get ZeittypDrop(): string[] {
    return Object.values(ApiZeitTyp);
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
    if (!this.isEditing && !this.isCreatingNew) return;
    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
    const minuteControlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten'; // ADD THIS LINE
    const currentHour = this.getHour(timeType);

    if (currentHour < 24) {
      const newHour = currentHour + 1;
      this.stempelzeitForm.get(controlName)?.setValue(newHour);
      if (newHour === 24) {
        this.stempelzeitForm.get(minuteControlName)?.setValue(0);
      }

      this.stempelzeitForm.markAsDirty();
    }
  }

  decreaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing && !this.isCreatingNew) return;
    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
    const currentHour = this.getHour(timeType);

    if (currentHour > 0) {
      this.stempelzeitForm.get(controlName)?.setValue(currentHour - 1);
      this.stempelzeitForm.markAsDirty();
      this.enforce24HourRule();
    }
  }

  increaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing && !this.isCreatingNew) return;
    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
    const currentMinute = this.getMinute(timeType);
    if (currentMinute < 59) {
      this.stempelzeitForm.get(controlName)?.setValue(currentMinute + 1);
      this.stempelzeitForm.markAsDirty();
    }
  }

  decreaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing && !this.isCreatingNew) return;
    const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
    const currentMinute = this.getMinute(timeType);
    if (currentMinute > 0) {
      this.stempelzeitForm.get(controlName)?.setValue(currentMinute - 1);
      this.stempelzeitForm.markAsDirty();
    }
  }

  validateTime(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    const hourControlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
    const minuteControlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';

    let hourValue = this.getHour(timeType);
    let minuteValue = this.getMinute(timeType);

    if (hourValue < 0) hourValue = 0;
    if (hourValue > 24) hourValue = 24;
    if (minuteValue < 0) minuteValue = 0;
    if (minuteValue > 59) minuteValue = 59;

    if (hourValue === 24 && minuteValue !== 0) {
      minuteValue = 0;
    }

    this.stempelzeitForm.get(hourControlName)?.setValue(hourValue);
    this.stempelzeitForm.get(minuteControlName)?.setValue(minuteValue);

    this.stempelzeitForm.markAsDirty();
    this.enforce24HourRule();
  }
  goBackToList() {
    this.router.navigate(['/civilian-service']);
  }
  loadData(id: string) {
    this.isLoading = true;
    console.log('Loading data with smart service for person:', id);

    this.dataService.getStempelzeitenSmart(id).subscribe({
      next: (stempelzeiten: ApiStempelzeit[]) => {
        console.log('Smart service returned:', stempelzeiten.length, 'entries');
        this.isLoading = false;

        this.allTimeEntries = stempelzeiten;
        this.timeEntries = [...stempelzeiten];

        if (stempelzeiten.length > 0) {
          const treeData = this.transformServiceDataToTree(stempelzeiten);
          console.log('Transformed tree data:', treeData);
          console.log('Tree data length:', treeData.length);
          if (treeData.length > 0) {
            console.log('First month node:', treeData[0]);
            console.log('First month children:', treeData[0].children);
            if (treeData[0].children && treeData[0].children.length > 0) {
              console.log('First day node:', treeData[0].children[0]);
              console.log('First day children:', treeData[0].children[0].children);
            }
          }
          this.dataSource.data = treeData;

          if (treeData.length > 0) {
            setTimeout(() => {
              if (treeData[0]) {
                this.treeControl.expand(treeData[0]);
              }
            });
          }
        } else {
          console.warn('No stempelzeiten found');
          this.dataSource.data = [];
          this.snackBar.open('Keine Stempelzeiten gefunden', 'Schließen', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error loading data from both sources:', error);
        this.isLoading = false;
        this.snackBar.open('Fehler beim Laden der Daten', 'Schließen', {
          duration: 5000,
          verticalPosition: 'top'
        });
        this.dataSource.data = [];
      }
    });
  }
  private createDayNodes(stempelzeiten: ApiStempelzeit[]): TreeNode[] {
    const groupedByDay: { [key: string]: ApiStempelzeit[] } = {};

    stempelzeiten.forEach(stempelzeit => {
      if (stempelzeit.login) {
        const loginDate = new Date(stempelzeit.login);
        const dayKey = this.formatDayName(loginDate);

        if (!groupedByDay[dayKey]) {
          groupedByDay[dayKey] = [];
        }
        groupedByDay[dayKey].push(stempelzeit);
      }
    });
    const dayNodes: TreeNode[] = [];
    Object.keys(groupedByDay).sort((a, b) => {
      const dateA = this.getDateFromFormattedDay(a);
      const dateB = this.getDateFromFormattedDay(b);
      return dateA.getTime() - dateB.getTime();
    }).forEach(dayKey => {
      // Filter out Saturdays (6) and Sundays (0)
      const date = this.getDateFromFormattedDay(dayKey);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return; // Skip weekends
      }

      const dayStempelzeiten = groupedByDay[dayKey];
      const dayCalculations = this.calculateDayStats(dayStempelzeiten);
      const dayNode: TreeNode = {
        name: dayKey,
        level: 1,
        expandable: true,
        arbeitszeit: dayCalculations.arbeitszeit,
        zeitTyp: dayCalculations.mainType,
        children: this.createStempelzeitNodes(dayStempelzeiten)
      };

      dayNodes.push(dayNode);
    });

    return dayNodes;
  }
  private calculateDayStats(stempelzeiten: ApiStempelzeit[]): {
    arbeitszeit: string;
    mainType: string;
  } {
    let totalWorkMinutes = 0;
    let mainType = 'ARBEITSZEIT';

    stempelzeiten.forEach(entry => {
      if (entry.login && entry.logoff) {
        const login = new Date(entry.login);
        const logoff = new Date(entry.logoff);
        const diffMs = logoff.getTime() - login.getTime();
        const minutes = Math.floor(diffMs / (1000 * 60));
        totalWorkMinutes += minutes;
        console.log('  -> Added', minutes, 'minutes. Total now:', totalWorkMinutes);
      } else {
        console.log('  -> Skipped (missing login or logoff)');
      }
      if (entry.zeitTyp && !this.isZeitTyp(entry, ApiZeitTyp.ARBEITSZEIT) && mainType === 'ARBEITSZEIT') {
        mainType = entry.zeitTyp;
      }
    });

    const workHours = Math.floor(totalWorkMinutes / 60);
    const workMinutes = totalWorkMinutes % 60;
    const arbeitszeit = `${workHours}:${workMinutes.toString().padStart(2, '0')}`;
    return {
      arbeitszeit,
      mainType
    };
  }
  private createStempelzeitNodes(stempelzeiten: ApiStempelzeit[]): TreeNode[] {
    return stempelzeiten.map(sz => {
      const loginTime = sz.login ? new Date(sz.login) : new Date();
      const logoffTime = sz.logoff ? new Date(sz.logoff) : new Date(sz.login || Date.now());
      const formData: FormDataStempelzeit = {
        datum: loginTime.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        zeittyp: sz.zeitTyp || ApiZeitTyp.ARBEITSZEIT,
        anmeldezeit: {
          stunde: loginTime.getHours(),
          minuten: loginTime.getMinutes()
        },
        abmeldezeit: {
          stunde: logoffTime.getHours(),
          minuten: logoffTime.getMinutes()
        },
        anmerkung: sz.anmerkung || ''
      };

      return {
        name: `${this.formatTime(loginTime)} - ${this.formatTime(logoffTime)}`,
        level: 2,
        expandable: false,
        formData: formData,
        zeitTyp: sz.zeitTyp || ApiZeitTyp.ARBEITSZEIT,
        stempelzeit: sz
      };
    });
  }
  getDayStempelzeitenText(dayNode: TreeNode | null): string {
    if (!dayNode) return '';
    const dayStempelzeiten = this.allTimeEntries.filter(entry => {
      if (!entry.login) return false;
      const entryDate = new Date(entry.login);
      const dayKey = this.formatDayName(entryDate);
      return dayKey === dayNode.name;
    });

    return dayStempelzeiten.map(entry => {
      const loginTime = entry.login ? this.getFormattedTime(entry.login) : '';
      const logoffTime = entry.logoff ? this.getFormattedTime(entry.logoff) : '';
      const type = this.getTypeDisplay(entry.zeitTyp || '');
      const anmerkung = entry.anmerkung ? ` [${entry.anmerkung}]` : '';

      return `${loginTime} - ${logoffTime} ${type}${anmerkung}`;
    }).join('\n');
  }
  addNewStempelzeit() {
    const currentTime = new Date();
    const currentDateString = currentTime.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formData: FormDataStempelzeit = {
      datum: currentDateString,
      zeittyp: ApiZeitTyp.ARBEITSZEIT,
      anmeldezeit: {
        stunde: 0,
        minuten: 0
      },
      abmeldezeit: {
        stunde: 0,
        minuten: 0
      },
      anmerkung: 'Neuer Eintrag'
    };

    const tempFlatNode: TreeNode = {
      name: `00:00 - 00:00`,
      level: 2,
      expandable: false,
      formData: formData,
      zeitTyp: ApiZeitTyp.ARBEITSZEIT,
      stempelzeit: {
        login: currentTime.toISOString(),
        logoff: currentTime.toISOString(),
        zeitTyp: ApiZeitTyp.ARBEITSZEIT,
        anmerkung: 'Neuer Eintrag',
        poKorrektur: false
      }
    };

    this.selectedStempelzeitNode = tempFlatNode;
    this.isCreatingNew = true;
    this.isEditing = true;

    this.populateForm(formData);
    this.updateFormControlsState();
  }
  onStempelzeitClick(node: TreeNode) {
    if (node.level === 2) {
      console.log('Processing Level 2 node');
      this.selectedStempelzeitNode = node;
      this.selectedDayNode = null;
      this.selectedMonth = null;
      if (node.formData) {
        console.log('Form data found, populating form');
        this.populateForm(node.formData);
      } else {
        console.log('NO form data found in node');
        if (node.stempelzeit) {
          this.createFormDataFromStempelzeit(node.stempelzeit);
        }
      }
      this.isEditing = false;
      this.isCreatingNew = false;
      console.log('Edit modes reset');
    } else {
      console.log('WRONG LEVEL - Expected level 2 but got:', node.level);
    }
  }
  private createFormDataFromStempelzeit(stempelzeit: ApiStempelzeit) {
    const loginTime = stempelzeit.login ? new Date(stempelzeit.login) : new Date();
    const logoffTime = stempelzeit.logoff ? new Date(stempelzeit.logoff) : new Date(stempelzeit.login || Date.now());

    const formData: FormDataStempelzeit = {
      datum: loginTime.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      zeittyp: stempelzeit.zeitTyp || ApiZeitTyp.ARBEITSZEIT,
      anmeldezeit: {
        stunde: loginTime.getHours(),
        minuten: loginTime.getMinutes()
      },
      abmeldezeit: {
        stunde: logoffTime.getHours(),
        minuten: logoffTime.getMinutes()
      },
      anmerkung: stempelzeit.anmerkung || ''
    };

    this.populateForm(formData);
  }
  populateForm(formData: FormDataStempelzeit) {
    console.log('Populating form with:', formData);

    this.stempelzeitForm.patchValue({
      datum: formData.datum,
      zeittyp: formData.zeittyp,
      anmeldezeitStunde: formData.anmeldezeit.stunde,
      anmeldezeitMinuten: formData.anmeldezeit.minuten,
      abmeldezeitStunde: formData.abmeldezeit.stunde,
      abmeldezeitMinuten: formData.abmeldezeit.minuten,
      anmerkung: formData.anmerkung || ''
    });

    this.stempelzeitForm.markAsPristine();
    setTimeout(() => {
      this.updateFormControlsState();
    }, 0);
  }
  startEditing() {
    if (!this.selectedStempelzeitNode) return;

    console.log('Starting edit mode');
    this.isEditing = true;
    this.isCreatingNew = false;
    if (this.selectedStempelzeitNode.formData) {
      this.originalFormData = { ...this.selectedStempelzeitNode.formData };
    }

    this.updateFormControlsState();
    this.cdr.detectChanges();
  }
  updateFormControlsState() {
    const isEditable = this.isEditing || this.isCreatingNew;

    if (isEditable) {
      this.stempelzeitForm.get('zeittyp')?.enable();
      this.stempelzeitForm.get('anmeldezeitStunde')?.enable();
      this.stempelzeitForm.get('anmeldezeitMinuten')?.enable();
      this.stempelzeitForm.get('abmeldezeitStunde')?.enable();
      this.stempelzeitForm.get('abmeldezeitMinuten')?.enable();
      this.stempelzeitForm.get('anmerkung')?.enable();

      if (this.isCreatingNew) {
        this.stempelzeitForm.get('datum')?.enable();
      } else {
        this.stempelzeitForm.get('datum')?.disable();
      }
    } else {
      this.stempelzeitForm.get('datum')?.disable();
      this.stempelzeitForm.get('zeittyp')?.disable();
      this.stempelzeitForm.get('anmeldezeitStunde')?.disable();
      this.stempelzeitForm.get('anmeldezeitMinuten')?.disable();
      this.stempelzeitForm.get('abmeldezeitStunde')?.disable();
      this.stempelzeitForm.get('abmeldezeitMinuten')?.disable();
      this.stempelzeitForm.get('anmerkung')?.disable();
    }
    this.enforce24HourRule();
    this.cdr.detectChanges();
  }

  addNewStempelzeitForDay(dayNode: TreeNode) {
    console.log('START addNewStempelzeitForDay');

    const dateMatch = dayNode.name.match(/(\d{2})\.\s+(\w+)/);
    let targetDate = new Date();

    if (dateMatch) {
      const [, day, monthName] = dateMatch;
      const monthMap: { [key: string]: number } = {
        'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
        'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
      };
      const month = monthMap[monthName] || new Date().getMonth();
      const year = new Date().getFullYear();
      targetDate = new Date(year, month, parseInt(day));
    }

    const currentDateString = targetDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const formData: FormDataStempelzeit = {
      datum: currentDateString,
      zeittyp: ApiZeitTyp.ARBEITSZEIT,
      anmeldezeit: {
        stunde: 0,
        minuten: 0
      },
      abmeldezeit: {
        stunde: 0,
        minuten: 0
      },
      anmerkung: 'Neuer Eintrag'
    };

    const tempNode: TreeNode = {
      name: `00:00 - 00:00`,
      level: 2,
      expandable: false,
      formData: formData,
      zeitTyp: ApiZeitTyp.ARBEITSZEIT,
      stempelzeit: {
        login: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0).toISOString(),
        logoff: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0).toISOString(),
        zeitTyp: ApiZeitTyp.ARBEITSZEIT,
        anmerkung: 'Neuer Eintrag',
        poKorrektur: false
      }
    };

    this.selectedStempelzeitNode = tempNode;
    this.isCreatingNew = true;
    this.isEditing = true;

    this.populateForm(formData);
    this.updateFormControlsState();
  }
  cancelNewEntry() {
    this.isCreatingNew = false;
    this.isEditing = false;
    this.selectedStempelzeitNode = null;
    this.stempelzeitForm.reset();
  }
  cancelFormChanges() {
    console.log('Cancelling form changes');

    if (this.isCreatingNew) {
      this.cancelNewEntry();
    } else if (this.selectedStempelzeitNode && this.selectedStempelzeitNode.formData) {
      this.populateForm(this.selectedStempelzeitNode.formData);
      this.isEditing = false;
      this.updateFormControlsState();
      this.stempelzeitForm.markAsPristine();
    }

    this.cdr.detectChanges();
  }
  onDropdownOpened() {
    console.log('Dropdown opened - Current state:', {
      isEditing: this.isEditing,
      isCreatingNew: this.isCreatingNew,
      currentValue: this.stempelzeitForm.get('zeittyp')?.value,
      isDisabled: this.stempelzeitForm.get('zeittyp')?.disabled
    });
  }
  onDropdownClosed() {
    console.log('Dropdown closed - isEditing:', this.isEditing, 'isCreatingNew:', this.isCreatingNew);
    if (this.isEditing || this.isCreatingNew) {
      setTimeout(() => {
        this.updateFormControlsState();
      }, 0);
    }
  }
  private parseGermanDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    const parts = dateString.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-based in JavaScript
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null;
    }

    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  }
  // NEW: Save stempelzeit using the service
  saveStempelzeit() {
    console.log('SAVE STEMPELZEIT ');

    const datumControl = this.stempelzeitForm.get('datum');
    const wasDatumDisabled = datumControl?.disabled;

    if (wasDatumDisabled) {
      datumControl?.enable();
      this.stempelzeitForm.updateValueAndValidity();
    }

    // Validate all form fields
    this.validateAllFormFields(this.stempelzeitForm);

    if (this.stempelzeitForm.valid && this.personId) {
      const formValue = this.stempelzeitForm.value;

      // Validate date
      const selectedDate = this.parseGermanDate(formValue.datum);
      if (!selectedDate) {
        if (wasDatumDisabled) datumControl?.disable();
        this.snackBar.open('Ungültiges Datumformat', 'Schließen', { duration: 3000, verticalPosition: 'top' });
        return;
      }

      // Validate time
      if (!this.isTimeValid(formValue)) {
        if (wasDatumDisabled) datumControl?.disable();
        this.snackBar.open('Ungültige Zeitangaben: Abmeldezeit muss nach Anmeldezeit liegen', 'Schließen', {
          duration: 5000,
          verticalPosition: 'top'
        });
        return;
      }
      const validationResult = this.validateTimeEntryOverlap(formValue);
      if (!validationResult.isValid) {
        if (wasDatumDisabled) datumControl?.disable();
        this.snackBar.open(validationResult.errorMessage || 'Ungültige Zeitangaben', 'Schließen', {
          duration: 5000,
          verticalPosition: 'top'
        });
        return;
      }
      const stempelzeit: ApiStempelzeit = {
        login: this.createDateTimeString(formValue.datum, formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten),
        logoff: this.createDateTimeString(formValue.datum, formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten),
        zeitTyp: formValue.zeittyp as ApiZeitTyp,
        anmerkung: formValue.anmerkung,
        poKorrektur: false
      };

      console.log('Saving stempelzeit:', stempelzeit);

      this.dataService.saveStempelzeitSmart(stempelzeit, this.personId, this.isCreatingNew).subscribe({
        next: (savedStempelzeit: ApiStempelzeit) => {
          console.log('Save successful:', savedStempelzeit);
          if (this.isCreatingNew) {
            this.allTimeEntries.push(savedStempelzeit);
          } else {
            const index = this.allTimeEntries.findIndex(entry =>
              entry.login === this.selectedStempelzeitNode?.stempelzeit?.login &&
              entry.logoff === this.selectedStempelzeitNode?.stempelzeit?.logoff
            );
            if (index !== -1) {
              this.allTimeEntries[index] = savedStempelzeit;
            }
          }
          this.refreshTree();

          this.snackBar.open('Stempelzeit gespeichert!', 'Schließen', {
            duration: 3000,
            verticalPosition: 'top'
          });

          this.resetForm();
        },
        error: (error: any) => {
          console.error('Save failed:', error);
          if (wasDatumDisabled) datumControl?.disable();
          this.snackBar.open('Fehler beim Speichern', 'Schließen', {
            duration: 3000,
            verticalPosition: 'top'
          });
        }
      });
    } else {
      if (wasDatumDisabled) datumControl?.disable();
      this.showValidationErrors();
    }
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

  private isTimeValid(formValue: any): boolean {
    const {
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    if (anmeldezeitStunde < 0 || anmeldezeitStunde > 24 ||
      abmeldezeitStunde < 0 || abmeldezeitStunde > 24 ||
      anmeldezeitMinuten < 0 || anmeldezeitMinuten > 59 ||
      abmeldezeitMinuten < 0 || abmeldezeitMinuten > 59) {
      return false;
    }

    if ((anmeldezeitStunde === 24 && anmeldezeitMinuten !== 0) ||
      (abmeldezeitStunde === 24 && abmeldezeitMinuten !== 0)) {
      return false;
    }

    const startTotalMinutes = anmeldezeitStunde * 60 + anmeldezeitMinuten;
    const endTotalMinutes = abmeldezeitStunde * 60 + abmeldezeitMinuten;

    if (startTotalMinutes === endTotalMinutes) {
      return true;
    }

    return endTotalMinutes > startTotalMinutes;
  }

  private validateTimeEntryOverlap(formValue: any): { isValid: boolean; errorMessage?: string } {
    const {
      datum,
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    if (!datum || typeof datum !== 'string' || datum.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Datum ist erforderlich'
      };
    }

    if (!this.isTimeValid(formValue)) {
      return {
        isValid: false,
        errorMessage: 'Ungültige Zeitangaben: Abmeldezeit muss nach Anmeldezeit liegen'
      };
    }

    const selectedDate = this.parseGermanDate(datum);
    if (!selectedDate) {
      return {
        isValid: false,
        errorMessage: 'Ungültiges Datumformat. Bitte verwenden Sie TT.MM.JJJJ'
      };
    }
    const startTime = new Date(selectedDate);
    startTime.setHours(anmeldezeitStunde, anmeldezeitMinuten, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(abmeldezeitStunde, abmeldezeitMinuten, 0, 0);

    const overlaps = this.checkForTimeOverlaps(
      startTime,
      endTime,
      this.selectedStempelzeitNode?.stempelzeit?.login
    );

    if (overlaps.hasOverlap) {
      return {
        isValid: false,
        errorMessage: `Zeitüberschneidung mit bestehendem Eintrag: ${overlaps.overlappingEntry}`
      };
    }

    return { isValid: true };
  }
  private checkForTimeOverlaps(
    newStart: Date,
    newEnd: Date,
    excludeEntryLogin?: string
  ): { hasOverlap: boolean; overlappingEntry?: string } {

    for (const entry of this.allTimeEntries) {
      if (excludeEntryLogin && entry.login === excludeEntryLogin) {
        continue;
      }

      if (!entry.login || !entry.logoff) continue;

      const existingStart = new Date(entry.login);
      const existingEnd = new Date(entry.logoff);

      const isSameDay = existingStart.toDateString() === newStart.toDateString();

      if (!isSameDay) {
        continue;
      }

      const hasOverlap = (newStart < existingEnd && newEnd > existingStart);

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
  private refreshTree() {
    const treeData = this.transformServiceDataToTree(this.allTimeEntries);
    this.dataSource.data = treeData;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.treeControl.dataNodes.forEach(node => {
        if (node.level === 0 && this.treeControl.isExpanded(node)) {
          this.treeControl.expand(node);
        }
      });
    });
  }

  deleteStempelzeit() {
    console.log('=== DELETE STEMPELZEIT (SMART MODE) ===');

    if (this.selectedStempelzeitNode && this.selectedStempelzeitNode.stempelzeit && this.personId) {
      const stempelzeitToDelete = this.selectedStempelzeitNode.stempelzeit;

      let entryDate = '';
      if (stempelzeitToDelete.login) {
        const loginDate = new Date(stempelzeitToDelete.login);
        entryDate = loginDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      this.showDeleteConfirmation('Stempelzeit', entryDate).then(confirmed => {
        if (confirmed) {
          console.log('Deleting:', stempelzeitToDelete);

          this.dataService.deleteStempelzeitSmart(stempelzeitToDelete, this.personId!).subscribe({
            next: () => {
              this.allTimeEntries = this.allTimeEntries.filter(entry =>
                !(entry.login === stempelzeitToDelete.login && entry.logoff === stempelzeitToDelete.logoff)
              );

              this.timeEntries = [...this.allTimeEntries];
              const treeData = this.transformServiceDataToTree(this.allTimeEntries);
              this.dataSource.data = treeData;

              this.snackBar.open('Stempelzeit gelöscht!', 'Schließen', {
                duration: 3000,
                verticalPosition: 'top'
              });
              this.resetForm();
            },
            error: (error) => {
              console.error('Delete failed:', error);
              this.snackBar.open('Fehler beim Löschen', 'Schließen', {
                duration: 3000,
                verticalPosition: 'top'
              });
            }
          });
        } else {
          console.log('Delete cancelled by user');
        }
      });
    }
  }
  private createDateTimeString(dateStr: string, hours: number, minutes: number): string {
    const [day, month, year] = dateStr.split('.');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes);
    return date.toISOString();
  }
  private resetForm() {
    this.stempelzeitForm.reset();
    this.isEditing = false;
    this.isCreatingNew = false;
    this.selectedStempelzeitNode = null;
  }
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  onMonthNodeClick(node: TreeNode) {
    console.log("Month NODE CLICKED:", node);
    this.selectedMonth = node.name;
    this.selectedDayNode = null;
    this.selectedStempelzeitNode = null;
    this.filterTimeEntriesByMonth(node.name);
  }
  private filterTimeEntriesByMonth(monthName: string) {
    if (!monthName || !this.allTimeEntries.length) {
      this.timeEntries = this.allTimeEntries;
      return;
    }

    const [monthStr, yearStr] = monthName.split(' ');

    if (!monthStr || !yearStr) {
      this.timeEntries = this.allTimeEntries;
      return;
    }
    // Map German month names to numbers
    const monthMap: { [key: string]: number } = {
      'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
      'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
    };

    const monthNumber = monthMap[monthStr];
    const year = parseInt(yearStr);
    if (isNaN(monthNumber) || isNaN(year)) {
      this.timeEntries = this.allTimeEntries;
      return;
    }
    this.timeEntries = this.allTimeEntries.filter(entry => {
      if (!entry.login) return '';
      const entryDate = new Date(entry.login);
      return entryDate.getMonth() === monthNumber && entryDate.getFullYear() === year;
    });
  }

  onDayClick(node: TreeNode) {
    console.log('=== onDayClick START ===');
    console.log('Day node clicked:', node.name, 'Level:', node.level);

    if (node.level !== 1) {
      console.log('WRONG LEVEL - Expected level 1 but got:', node.level);
      return;
    }
    this.selectedDayNode = node;
    this.selectedStempelzeitNode = null;
    this.selectedMonth = null;
    console.log('Day selection set:', this.selectedDayNode?.name);
    console.log('Month cleared:', this.selectedMonth);
    console.log('Stempelzeit cleared:', this.selectedStempelzeitNode);

    // Extract date from node.name (DD.MM.YYYY)
    const dateMatch = node.name.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (!dateMatch) {
      console.log('No date match found in node name:', node.name);
      return;
    }

    const [, day, month, year] = dateMatch;
    const selectedDate = `${year}-${month}-${day}`;
    console.log('Extracted date:', selectedDate);

    // Filter timeEntries for this day
    this.selectedDayEntries = this.allTimeEntries.filter(entry => {
      if (!entry.login) return '';

      const entryDate = entry.login.split('T')[0];
      return entryDate === selectedDate;
    });
    this.cdr.detectChanges();
  }

  private transformServiceDataToTree(serviceData: ApiStempelzeit[]): TreeNode[] {
    if (!serviceData || !Array.isArray(serviceData)) {
      console.warn('Invalid service data format');
      return [];
    }

    // Group entries by month and year
    const groupedEntries = this.groupEntriesByMonth(serviceData);

    // Sort months from oldest to newest (ascending order)
    return Object.keys(groupedEntries)
      .sort((a, b) => a.localeCompare(b))
      .map(monthKey => {
        const monthData = groupedEntries[monthKey];
        const [year, month] = monthKey.split('-');
        const monthName = this.getGermanMonthName(parseInt(month)) + ' ' + year;

        const calculations = this.calculateMonthStats(monthData);

        const monthNode: TreeNode = {
          name: monthName,
          level: 0,
          expandable: true,
          year: year,
          arbeitszeit: calculations.arbeitszeit,
          sollArbeitszeit: calculations.sollArbeitszeit,
          saldo: calculations.saldo,
          urlaubstage: calculations.urlaubstage,
          urlaub: calculations.urlaub,
          children: this.createDayNodes(monthData)
        };

        // console.log('=== MONTH NODE CREATED ===');
        // console.log('Month:', monthName);
        // console.log('arbeitszeit:', monthNode.arbeitszeit);
        // console.log('sollArbeitszeit:', monthNode.sollArbeitszeit);
        // console.log('saldo:', monthNode.saldo);
        // console.log('urlaubstage:', monthNode.urlaubstage);
        // console.log('urlaub:', monthNode.urlaub);
        // console.log('=========================');

        return monthNode;
      });
  }

  private calculateMonthStats(entries: ApiStempelzeit[]): {
    arbeitszeit: string;
    sollArbeitszeit: string;
    saldo: string;
    urlaubstage: string;
    urlaub: string;
  } {
    console.log('=== calculateMonthStats START ===');
    console.log('Total entries:', entries.length);

    let totalWorkMinutes = 0;
    let urlaubCount = 0;

    // Calculate actual worked time and count vacation days
    entries.forEach((entry, index) => {
      console.log(`Entry ${index + 1}:`, {
        zeitTyp: entry.zeitTyp,
        login: entry.login,
        logoff: entry.logoff
      });
      if (this.isZeitTyp(entry, ApiZeitTyp.ARBEITSZEIT)) {
        if (entry.login && entry.logoff) {
          const login = new Date(entry.login);
          const logoff = new Date(entry.logoff);
          const diffMs = logoff.getTime() - login.getTime();
          const minutes = Math.floor(diffMs / (1000 * 60));
          totalWorkMinutes += minutes;
          console.log(`  -> ARBEITSZEIT: Added ${minutes} minutes`);
        }
      } else if (this.isZeitTyp(entry, ApiZeitTyp.URLAUB)) {
        urlaubCount++;
        console.log(`  -> URLAUB: Count incremented to ${urlaubCount}`);
      } else {
        console.log(`  -> OTHER TYPE: ${entry.zeitTyp}`);
      }
    });

    // Calculate working days more accurately
    const workingDays = this.calculateWorkingDays(entries);
    console.log('Working days:', workingDays);

    // Standard working hours (8 hours per day)
    const standardMinutes = workingDays * 8 * 60;
    console.log('Standard minutes:', standardMinutes);

    // Format Arbeitszeit (actual worked time)
    const workHours = Math.floor(totalWorkMinutes / 60);
    const workMinutes = totalWorkMinutes % 60;
    const arbeitszeit = `${workHours}:${workMinutes.toString().padStart(2, '0')}`;

    // Format Soll-Arbeitszeit
    const sollHours = Math.floor(standardMinutes / 60);
    const sollArbeitszeit = `${sollHours}:00`
    // Calculate saldo (difference between actual and standard)
    const diffMinutes = totalWorkMinutes - standardMinutes;
    const sign = diffMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(diffMinutes);
    const saldoHours = Math.floor(absMinutes / 60);
    const saldoMinutes = absMinutes % 60;
    const saldo = `${sign}${saldoHours}:${saldoMinutes.toString().padStart(2, '0')}`;
    // Format Urlaub (used/total) - assuming 10 total vacation days
    const urlaub = `${urlaubCount}/10`;

    console.log('RESULTS:', {
      arbeitszeit,
      sollArbeitszeit,
      saldo,
      urlaubstage: urlaubCount.toString(),
      urlaub
    });
    console.log('=== calculateMonthStats END ===');

    return {
      arbeitszeit,
      sollArbeitszeit,
      saldo,
      urlaubstage: urlaubCount.toString(),
      urlaub
    };
  }
  private groupEntriesByMonth(entries: ApiStempelzeit[]): { [key: string]: ApiStempelzeit[] } {
    const grouped: { [key: string]: ApiStempelzeit[] } = {};

    entries.forEach(entry => {
      if (!entry.login) return;

      const date = new Date(entry.login);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(entry);
    });

    return grouped;
  }
  private convertApiZeitTypToEnum(apiZeitTyp: string | undefined): ApiZeitTyp {
    if (!apiZeitTyp) return ApiZeitTyp.ARBEITSZEIT;

    const mapping: { [key: string]: ApiZeitTyp } = {
      'ARBEITSZEIT': ApiZeitTyp.ARBEITSZEIT,
      'REMOTEZEIT': ApiZeitTyp.REMOTEZEIT,
      'BEREITSCHAFT': ApiZeitTyp.BEREITSCHAFT,
      'URLAUB': ApiZeitTyp.URLAUB,
      'ZEITAUSGLEICH': ApiZeitTyp.ZEITAUSGLEICH,
      'KRANKENSTAND': ApiZeitTyp.KRANKENSTAND,
      'GUTSCHRIFT': ApiZeitTyp.GUTSCHRIFT,
      'ABWESENHEIT': ApiZeitTyp.ABWESENHEIT,
      'TELEARBEIT': ApiZeitTyp.TELEARBEIT
    };

    return mapping[apiZeitTyp] || ApiZeitTyp.ARBEITSZEIT;
  }

  private isZeitTyp(entry: ApiStempelzeit, expectedType: ApiZeitTyp): boolean {
    return this.convertApiZeitTypToEnum(entry.zeitTyp) === expectedType;
  }
  private calculateWorkingDays(entries: ApiStempelzeit[]): number {
    const uniqueDays = new Set();

    entries.forEach(entry => {
      // FIX: Use helper method for comparison
      if (this.isZeitTyp(entry, ApiZeitTyp.ARBEITSZEIT) && entry.login) {
        const date = new Date(entry.login);
        const dateString = date.toISOString().split('T')[0];
        uniqueDays.add(dateString);
      }
    });

    return uniqueDays.size;
  }

  // private createChildNodes(monthEntries: ApiStempelzeit[]): TreeNode[] {
  //   return monthEntries.map(entry => ({
  //     name: `${this.getFormattedDate(entry.login)} - ${this.getFormattedTime(entry.login)}-${this.getFormattedTime(entry.logoff)}`,
  //     level: 1,
  //     expandable: false,
  //     arbeitszeit: this.calculateHours(entry.login, entry.logoff),
  //     zeitTyp: entry.zeitTyp,
  //     login: entry.login,
  //     logoff: entry.logoff,
  //     anmerkung: entry.anmerkung || ''
  //   }));
  // }

  private getGermanMonthName(monthNumber: number): string {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[monthNumber - 1] || 'Unbekannt';
  }

  showAllEntries() {
    this.selectedMonth = null;
    this.timeEntries = this.allTimeEntries;
  }
  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getFormattedTime(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  calculateHours(login: string | undefined, logoff: string | undefined): string {
    if (!login || !logoff) return '00:00';

    const loginDate = new Date(login);
    const logoffDate = new Date(logoff);
    const diffMs = logoffDate.getTime() - loginDate.getTime();

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}`;
  }
  getWeek(entry: ApiStempelzeit): string {
    if (!entry.login) return '';  // Add null check
    const date = new Date(entry.login);
    const weekDay = date.toLocaleDateString('de-DE', { weekday: 'long' })
    return weekDay.slice(0, 2);
  }

  ///child  methode///
  getDayOfWeekFromNode(node: TreeNode | null): string {
    if (!node) return '';

    const dateMatch = node.name.match(/(\w{2})\s+(\d{1,2})\.\s+(\w+)/);
    if (dateMatch) {
      const [, weekdayShort] = dateMatch;
      return weekdayShort;
    }
    return '';
  }
  getFullDayOfWeekFromNode(node: TreeNode | null): string {
    if (!node) return '';

    const dateMatch = node.name.match(/(\w{2})\s+(\d{1,2})\.\s+(\w+)/);
    if (dateMatch) {
      const [, , day, monthName] = dateMatch;
      const monthMap: { [key: string]: number } = {
        'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
        'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
      };
      const month = monthMap[monthName];
      if (month !== undefined) {
        const year = new Date().getFullYear();
        const date = new Date(year, month, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('de-DE', { weekday: 'long' });
        }
      }
    }
    return '';
  }

  getDateDisplayFromNode(node: TreeNode | null): string {
    if (!node) return '';
    const dateMatch = node.name.match(/(\w{2})\s+(\d{1,2})\.\s+(\w+)/);
    if (dateMatch) {
      const [, , day, monthName] = dateMatch;
      return `${day.padStart(2, '0')}. ${monthName}`;
    }
    return '';
  }

  extractTimeFromNodeName(node: TreeNode): string {
    const timeMatch = node.name.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[0] : '';
  }
  getTypeDisplay(zeitType: string): string {
    if (zeitType === 'Arbeitszeit' || zeitType === 'Urlaub' || zeitType === 'Krankheit' || zeitType === 'Sonstiges') {
      return zeitType;
    }

    switch (zeitType) {
      case 'ARBEITSZEIT': return 'Arbeitszeit';
      case 'URLAUB': return 'Urlaub';
      case 'KRANKHEIT': return 'Krankheit';
      case 'SONSTIGES': return 'Sonstiges';
      case 'REMOTEZEIT': return 'Remotezeit';
      case 'BEREITSCHAFT': return 'Bereitschaft';
      case 'ZEITAUSGLEICH': return 'Zeitausgleich';
      case 'KRANKENSTAND': return 'Krankenstand';
      case 'GUTSCHRIFT': return 'Gutschrift';
      case 'ABWESENHEIT': return 'Abwesenheit';
      case 'TELEARBEIT': return 'Telearbeit';
      default: return zeitType;
    }
  }

  ////create new third level/////
  private getMonthYearString(date: Date): string {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
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

  private formatDayName(date: Date): string {
    const weekdays: { [key: number]: string } = {
      0: 'So', 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa'
    };
    const weekday = weekdays[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('de-DE', { month: 'long' });
    return `${weekday} ${day}. ${month}`;
  }

  private getDateFromFormattedDay(dayString: string): Date {
    const parts = dayString.split(' ');
    if (parts.length < 3) return new Date();
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
  onNodeClick(node: TreeNode) {
    this.selectedMonth = null;
    this.selectedDayNode = null;
    this.selectedStempelzeitNode = null;

    switch (node.level) {
      case 0: // Month
        console.log('Processing Level 0 (Month)');
        this.selectedMonth = node.name;
        this.filterTimeEntriesByMonth(node.name);
        break;

      case 1: // Day
        console.log('Processing Level 1 (Day)');
        this.selectedDayNode = node;

        // Accordion behavior: Close all other day nodes
        this.closeAllDayNodesExcept(node);

        const dayStempelzeiten = this.allTimeEntries.filter(entry => {
          if (!entry.login) return false;
          const entryDate = new Date(entry.login);
          const dayKey = this.formatDayName(entryDate);
          return dayKey === node.name;
        });
        this.selectedDayEntries = dayStempelzeiten;
        break;

      case 2: // Stempelzeit
        console.log('Processing Level 2 (Stempelzeit)');
        this.selectedStempelzeitNode = node;
        this.selectedDayNode = null;
        this.selectedMonth = null;

        if (node.formData) {
          console.log('Form data found, populating form');
          this.populateForm(node.formData);
        } else if (node.stempelzeit) {
          console.log('Creating form data from stempelzeit');
          this.createFormDataFromStempelzeit(node.stempelzeit);
        }

        this.isEditing = false;
        this.isCreatingNew = false;
        this.updateFormControlsState();
        break;

      default:
        console.log('Unknown level:', node.level);
    }
    this.cdr.detectChanges();
  }

  /**
   * Closes all day nodes (level 1) except the specified node
   * This creates an accordion effect where only one day is expanded at a time
   */
  private closeAllDayNodesExcept(nodeToKeepOpen: TreeNode): void {
    // Iterate through all month nodes in the data source
    this.dataSource.data.forEach(monthNode => {
      if (monthNode.children) {
        // Iterate through all day nodes within each month
        monthNode.children.forEach(dayNode => {
          // If this day node is not the one we want to keep open, collapse it
          if (dayNode !== nodeToKeepOpen && this.treeControl.isExpanded(dayNode)) {
            this.treeControl.collapse(dayNode);
          }
        });
      }
    });
  }

  /**
   * Handles the toggle button click for day nodes (level 1)
   * Implements accordion behavior: closes all other days when opening a day
   */
  onDayToggle(node: TreeNode, event: Event): void {
    event.stopPropagation(); // Prevent the click from bubbling to parent

    // Check if the node is currently expanded
    const isCurrentlyExpanded = this.treeControl.isExpanded(node);

    if (!isCurrentlyExpanded) {
      // If we're about to expand this node, close all other day nodes first
      this.closeAllDayNodesExcept(node);
    }

    // Now toggle the current node (expand or collapse)
    this.treeControl.toggle(node);
  }

  isNodeSelected(node: TreeNode): boolean {
    return node === this.selectedStempelzeitNode;
  }
  onZeittypChange(event: any) {
    if ((this.isEditing || this.isCreatingNew) && this.selectedStempelzeitNode) {
      this.stempelzeitForm.markAsDirty();
      if (this.selectedStempelzeitNode.formData) {
        this.selectedStempelzeitNode.formData.zeittyp = event.value;
      }
      if (this.selectedStempelzeitNode.stempelzeit) {
        this.selectedStempelzeitNode.stempelzeit.zeitTyp = event.value as ApiZeitTyp;
      }

      this.cdr.detectChanges();
    }
  } // methods to calculate colors based on values
  getSaldoColor(saldo: string | undefined): string {
    if (!saldo) return 'neutral';
    const saldoStr = saldo.replace('+', '').trim();

    if (saldoStr.startsWith('-')) {
      return 'negative';
    } else if (saldoStr === '0:00' || saldoStr === '00:00') {
      return 'neutral';
    } else {
      return 'positive';
    }
  }
  getArbeitszeitColor(arbeitszeit: string | undefined, sollArbeitszeit: string | undefined): string {
    if (!arbeitszeit || !sollArbeitszeit) return 'neutral';

    // Convert time strings to minutes for comparison
    const actualMinutes = this.timeStringToMinutes(arbeitszeit);
    const targetMinutes = this.timeStringToMinutes(sollArbeitszeit);

    if (actualMinutes < targetMinutes) {
      return 'negative';
    } else if (actualMinutes > targetMinutes) {
      return 'positive';
    } else {
      return 'neutral';
    }
  }
  getRowColor(zeitTyp: string | undefined): string {
    if (!zeitTyp) return '';

    switch (zeitTyp) {
      case 'ARBEITSZEIT':
        return 'arbeitszeit-row';
      case 'URLAUB':
        return 'urlaub-row';
      case 'KRANKHEIT':
      case 'KRANKENSTAND':
        return 'krankheit-row';
      case 'ABWESENHEIT':
        return 'abwesenheit-row';
      case 'ZEITAUSGLEICH':
        return 'zeitausgleich-row';
      case 'SONSTIGES':
        return 'sonstiges-row';
      default:
        return '';
    }
  }

  // Helper method to convert time string (HH:MM) to minutes
  private timeStringToMinutes(timeStr: string): number {
    if (!timeStr) return 0;

    const [hours, minutes] = timeStr.split(':').map(part => parseInt(part, 10) || 0);
    return hours * 60 + minutes;
  }

  isPositive(value: string | undefined): boolean {
    if (!value) return false;
    // For Saldo: values starting with + should be green
    if (value.startsWith('+')) return true;
    if (value.includes(':')) {
      const [hours, minutes] = value.split(':').map(part => parseInt(part, 10) || 0);
      const totalMinutes = hours * 60 + minutes;
      return totalMinutes > 0;
    }

    return false;
  }
  isNegative(value: string | undefined): boolean {
    if (!value) return false;
    return value.startsWith('-');
  }
  isNeutral(value: string | undefined): boolean {
    if (!value) return true;
    if (value === '00:00' || value === '0:00' || value === '0' || value === '+00:00' || value === '-00:00') {
      return true;
    }
    if (value.includes(':')) {
      const [hours, minutes] = value.split(':').map(part => parseInt(part, 10) || 0);
      const totalMinutes = hours * 60 + minutes;
      return totalMinutes === 0;
    }
    return false;
  }

  // Calculate saldo for table (8 hours standard work day)
  calculateSaldo(entry: ApiStempelzeit): string {
    if (!entry.login || !entry.logoff) return '00:00';
    const loginDate = new Date(entry.login);
    const logoffDate = new Date(entry.logoff);
    const diffMs = logoffDate.getTime() - loginDate.getTime();
    // Calculate actual worked minutes
    const actualMinutes = Math.floor(diffMs / (1000 * 60));
    // Standard work day is 8 hours = 480 minutes
    const standardMinutes = 8 * 60;
    // Calculate difference
    const diffMinutes = actualMinutes - standardMinutes;
    // Format the result
    const sign = diffMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(diffMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  private async showDeleteConfirmation(entryName: string, entryDate?: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      panelClass: 'confirmation-dialog-panel',
      data: {
        title: 'Löschen bestätigen',
        message: `Möchten Sie "${entryName}"${entryDate ? ` vom ${entryDate}` : ''} wirklich löschen?`,
        confirmText: 'Ja',
        cancelText: 'Nein'
      }
    });
    return await dialogRef.afterClosed().toPromise();
  }
  // Get color value for saldo
  getSaldoColorValue(saldo: string): string {
    if (this.isPositive(saldo)) {
      return '#28a745';
    } else if (this.isNegative(saldo)) {
      return '#dc3545';
    } else {
      return '#6f42c1';
    }
  }
  // Get font weight for saldo
  getSaldoFontWeight(saldo: string): string {
    if (this.isPositive(saldo) || this.isNegative(saldo)) {
      return 'bold';
    }
    return 'normal';
  }

  getRowBackgroundClass(zeitTyp: string | undefined): string {
    if (!zeitTyp) return '';
    const typeUpper = zeitTyp.toUpperCase();
    switch (typeUpper) {
      case 'ARBEITSZEIT':
        return 'row-arbeitszeit';
      case 'URLAUB':
        return 'row-urlaub';
      case 'KRANKENSTAND':
      case 'KRANKHEIT':
        return 'row-krankenstand';
      case 'ABWESENHEIT':
        return 'row-abwesenheit';
      case 'ZEITAUSGLEICH':
        return 'row-zeitausgleich';
      default:
        return 'row-default';
    }
  }
  // Get color for Arbeitszeit label (same as value)
  getArbeitszeitLabelColor(arbeitszeit: string | undefined): string {
    return this.getArbeitszeitValueColor(arbeitszeit);
  }
  // Get color for Arbeitszeit value
  getArbeitszeitValueColor(arbeitszeit: string | undefined): string {
    if (this.isPositive(arbeitszeit)) {
      return '#28a745';
    } else if (this.isNegative(arbeitszeit)) {
      return '#dc3545';
    } else {
      return 'gray';
    }
  }
  // Get color for Urlaubstage (vacation days count)
  getUrlaubstageColor(urlaubstage: string | undefined): string {
    if (!urlaubstage) return 'gray';
    const days = parseInt(urlaubstage, 10);
    if (days > 5) {
      return '#28a745';
    } else {
      return 'gray';
    }
  }

  getUrlaubColor(urlaub: string | undefined): string {
    if (!urlaub) return 'gray';
    const parts = urlaub.split('/');
    if (parts.length !== 2) return 'gray';
    const used = parseInt(parts[0], 10);
    const total = parseInt(parts[1], 10);
    if (isNaN(used) || isNaN(total)) return 'gray';
    const percentage = (used / total) * 100;
    if (percentage > 70) {
      return '#dc3545'; // Red - most vacation used
    } else {
      return 'gray'; // Purple - no vacation used
    }
  }

  // Get font weight for any value
  getValueFontWeight(value: string | undefined): string {
    if (this.isPositive(value) || this.isNegative(value)) {
      return 'bold';
    }
    return 'normal';
  }


  private enforce24HourRule(): void {
    const anmeldeHour = this.getHour('anmeldezeit');
    const abmeldeHour = this.getHour('abmeldezeit');

    const isEditable = this.isEditing || this.isCreatingNew;

    // Check Anmeldezeit
    if (anmeldeHour === 24) {
      this.stempelzeitForm.get('anmeldezeitMinuten')?.setValue(0);
      if (!isEditable) {
        this.stempelzeitForm.get('anmeldezeitMinuten')?.disable();
      }
    }

    // Check Abmeldezeit
    if (abmeldeHour === 24) {
      this.stempelzeitForm.get('abmeldezeitMinuten')?.setValue(0);
      if (!isEditable) {
        this.stempelzeitForm.get('abmeldezeitMinuten')?.disable();
      }
    }
  }
}
