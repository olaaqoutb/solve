import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { DummyService } from '../../../services/dummy.service';
// import { TatigkeitenKorrigierenService } from '../../../services/tatigkeiten-korrigieren.service';
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
import { forkJoin } from 'rxjs';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FlatNode } from '../../../models/Flat-node';
import { TaetigkeitNode } from '../../../models/TaetigkeitNode';

// Import utility services
import { FormValidationService } from '../../../services/utils/form-validation.service';
import { TimeUtilityService } from '../../../services/utils/time-utility.service';
import { TreeNodeService } from '../../../services/utils/tree-node.service';
import { TimeOverlapService } from '../../../services/utils/time-overlap.service';
import { DropdownExtractorService } from '../../../services/utils/dropdown-extractor.service';
// import { TreeExpansionService } from '../../../services/utils/tree-expansion.service';
import { DateParserService } from '../../../services/utils/date-parser.service';
// import { TimeInputService } from '../../../services/utils/time-input.service';
import { ActivityFormService } from '../../../services/utils/activity-form.service';
// import { ActivityDataService } from '../../../services/utils/activity-data.service';
import { NotificationService } from '../../../services/utils/notification.service';
import { TreeManagementService } from '../../../services/utils/tree-management.service';
import { DialogService } from '../../../services/utils/dialog.service';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../../services/custom-date-adapter.service';
import { ApiProdukt } from '../../../models-2/ApiProdukt';
import { ApiProduktPosition } from '../../../models-2/ApiProduktPosition';
import { ApiProduktPositionBuchungspunkt } from '../../../models-2/ApiProduktPositionBuchungspunkt';
import { ApiTaetigkeitTyp } from '../../../models-2/ApiTaetigkeitTyp';
import { ApiTaetigkeitsbuchung } from '../../../models-2/ApiTaetigkeitsbuchung';
import { ApiAbschlussInfo } from '../../../models-2/ApiAbschlussInfo';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-tatigkeiten-buchen-details',
  imports: [
    MatProgressSpinnerModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    CommonModule,
    MatCheckbox,
    ConfirmationDialogComponent,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
  ],

  templateUrl: './tatigkeiten-buchen-details.component.html',
  styleUrl: './tatigkeiten-buchen-details.component.scss'
})
export class TatigkeitenBuchenDetailsComponent {
  buchungsartOptions = ['ARBEITSZEIT', 'REMOTEZEIT'];
  produktOptions:ApiProdukt[] = [];
  produktpositionOptions:ApiProduktPosition[]= [];
  buchungspunktOptions: ApiProduktPositionBuchungspunkt[] = [];

  taetigkeitOptions: { taetigkeitTyp: ApiTaetigkeitTyp }[] = [
    { taetigkeitTyp: ApiTaetigkeitTyp.PROGRAMMIERUNG },
    { taetigkeitTyp: ApiTaetigkeitTyp.DEPLOYMENT },
    { taetigkeitTyp: ApiTaetigkeitTyp.BERICHT },
    { taetigkeitTyp: ApiTaetigkeitTyp.BESPRECHUNG },
    { taetigkeitTyp: ApiTaetigkeitTyp.DATENBANKDESIGN },
    { taetigkeitTyp: ApiTaetigkeitTyp.PROJEKTMANAGEMENT }
  ];

  dropdownOptions: string[] = ["2025", "2024", "2023", "2022", "2021", "2020"];
  selectedOption: string = this.dropdownOptions[0];

  // Tree control
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  isCreatingNewThirdLevel = false;
  alarmNode: FlatNode | null = null;
  showRightPanelAlarmActions = false;
  selectedNode: FlatNode | null = null;
  isEditing = false;
  isLoading = true;
  personName: string = '';
  isCreatingNew = false;
  isNewlyCreated = false;
  // Forms
  taetigkeitForm: FormGroup;
  monthForm: FormGroup;
  dayForm: FormGroup;
  alarmForm: FormGroup;
  abschlussInfo: ApiAbschlussInfo | null = null;
  personId!: string;

  // Field display map for validation
  private fieldDisplayMap: { [key: string]: string } = {
    'datum': 'Datum',
    'buchungsart': 'Buchungsart',
    'anmeldezeitStunde': 'Anmeldezeit Stunde',
    'anmeldezeitMinuten': 'Anmeldezeit Minuten',
    'abmeldezeitStunde': 'Abmeldezeit Stunde',
    'abmeldezeitMinuten': 'Abmeldezeit Minuten',
    'anmerkung': 'Anmerkung'
  };

  // Person request configuration
  private readonly personRequest = {
    detail: 'FullPvTlName',
    berechneteStunden: true,
    addVertraege: false
  };
// log(){
//   console.log(this.buchungspunktOptions,this. produktpositionOptions)
// }
 private transformer = (node: TaetigkeitNode, level: number): FlatNode => {
  const flatNode: FlatNode = {
    expandable: level === 0 ? (!!node.children && node.children.length > 0) :
                level === 1 ? true :
                (!!node.children && node.children.length > 0),
    name: node.name,
    level: level,
    hasNotification: node.hasNotification || false,
    formData: node.formData,
    stempelzeitData: node.stempelzeitData,
    monthName: node.monthName,
    gebuchtTotal: node.gebuchtTotal,
    dayName: node.dayName,
    gestempelt: node.gestempelt,
    gebucht: node.gebucht,
    stempelzeitenList: node.stempelzeitenList,
    productName: node.productName,
    positionName: node.positionName,
    gebuchtTime: node.gebuchtTime,
    timeRange: node.timeRange
  };

  return flatNode;
};

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dummyService: DummyService,
    //  private dummyService: DummyService,
    private formValidationService: FormValidationService,
    private timeUtilityService: TimeUtilityService,
    private treeNodeService: TreeNodeService,
    private timeOverlapService: TimeOverlapService,
    private dropdownExtractorService: DropdownExtractorService,
    // private treeBuilderService: TreeBuilderService,
    private dateParserService: DateParserService,
    // private timeInputService: TimeInputService,
    private activityFormService: ActivityFormService,

    // private activityDataService: ActivityDataService,
    private notificationService: NotificationService,
    private treeManagementService: TreeManagementService,
    private dialogService: DialogService
  ) {
    this.taetigkeitForm = this.activityFormService.createActivityForm();
    this.monthForm = this.activityFormService.createMonthForm();
    this.dayForm = this.activityFormService.createDayForm();
    this.alarmForm = this.activityFormService.createAlarmForm();
  }

 ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const personId = params.get('id');
      if (personId) {
        this.personId = personId;
        this.loadData(personId);
      }
    });
    this.taetigkeitForm.valueChanges.subscribe(() => {
      if (this.isEditing) {
        this.updateMinutenDauer();
      }
    });
  }

  private updateMinutenDauer(): void {
    const startHour = this.taetigkeitForm.get('anmeldezeitStunde')?.value || 0;
    const startMin = this.taetigkeitForm.get('anmeldezeitMinuten')?.value || 0;
    const endHour = this.taetigkeitForm.get('abmeldezeitStunde')?.value || 0;
    const endMin = this.taetigkeitForm.get('abmeldezeitMinuten')?.value || 0;

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    const durationMin = endTotalMin - startTotalMin;

    if (durationMin > 0) {
      this.taetigkeitForm.patchValue(
        { minutenDauer: durationMin },
        { emitEvent: false }
      );

      const hours = Math.floor(durationMin / 60);
      const minutes = durationMin % 60;
      const gebuchtDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      this.taetigkeitForm.patchValue(
        { gebucht: gebuchtDisplay },
        { emitEvent: false }
      );
    }
  }

loadData(personId: string) {
  this.isLoading = true;

  const startDate = `${this.selectedOption}-01-01`;
  const endDate = `${this.selectedOption}-12-31`;

  this.dummyService.getPerson(
    personId,
    this.personRequest.detail,
    this.personRequest.berechneteStunden,
    this.personRequest.addVertraege
  ).subscribe({
    next: (person) => {
      this.personName = `${person.vorname} ${person.nachname}`;
      forkJoin({
        products: this.dummyService.getPersonProdukte(
          personId,
            "",
          startDate,
          endDate
        ),
        stempelzeiten: this.dummyService.getPersonStempelzeiten(
          personId,
          startDate,
          endDate
        )
      }).subscribe({
        next: (results) => {

          this.produktOptions = results.products;
          this.extractDropdownOptions(results.products);

          const treeData = this.treeManagementService.transformToTreeStructure(
            results.products,
            results.stempelzeiten,
             parseInt(this.selectedOption)
          );
          this.dataSource.data = treeData;
          this.isLoading = false;

        }

        ,
        error: (error) => {
          console.error('Error loading data:', error);
          this.isLoading = false;
        }
      });
    },
    error: (error) => {
      console.error('Error loading person:', error);
      this.isLoading = false;
    }
  });

 this.dummyService.abschlussInfo(personId).subscribe({
      next: (info) => {
        this.abschlussInfo = info;
        console.log('Abschluss Info loaded:', info);
      },
      error: (error) => {
        console.error('Error loading abschluss info:', error);
      }
    });
  }
  extractDropdownOptions(products:ApiProdukt[]) {
    const options = this.dropdownExtractorService.extractDropdownOptions(products);
    this.produktpositionOptions = options.produktpositionOptions;
    this.buchungspunktOptions = options.buchungspunktOptions;
  }

  goBackToList() {
    this.router.navigate(['/book-activities']);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;



  onNodeClick(node: FlatNode) {
    console.log('Node clicked:', node.level, node.name);

    if (this.showRightPanelAlarmActions && node !== this.alarmNode) {
      this.resetAlarmState();
    }

    this.isNewlyCreated = false;
    this.isCreatingNew = false;
    this.isEditing = false;

    this.selectedNode = node;

    if (node.level === 2 && node.formData) {
      this.activityFormService.populateActivityForm(this.taetigkeitForm, node.formData);
    }
   else if (node.level === 0) {
  this.activityFormService.populateMonthForm(this.monthForm, node);

  const isEditable = !node.hasNotification;
  this.activityFormService.setSummaryFormState(
    this.monthForm,
    isEditable
  );

} else if (node.level === 1) {
  this.activityFormService.populateDayForm(this.dayForm, node);

  const isEditable = !node.hasNotification;
  this.activityFormService.setSummaryFormState(
    this.dayForm,
    isEditable
  );
}

    this.formValidationService.disableAllFormControls(this.taetigkeitForm);
  }

  saveForm() {
    this.formValidationService.validateAllFields(this.taetigkeitForm);

    if (!this.taetigkeitForm.valid) {
      this.showValidationErrors();
      return;
    }

    const formValue = this.taetigkeitForm.getRawValue();
    this.validate(formValue);
  }


private validate(formValue: any): void {
  const isDurationBased = formValue.durationStunde !== undefined && formValue.durationMinuten !== undefined;

  let formValueForValidation: any;

  if (isDurationBased) {
    const durationHours = formValue.durationStunde || 0;
    const durationMinutes = formValue.durationMinuten || 0;
    if (durationHours === 0 && durationMinutes === 0) {
      this.notificationService.invalidDuration();
      return;
    }
    const { endHour, endMinute } = this.activityFormService.calculateDurationEndTime(
      0,
      0,
      durationHours,
      durationMinutes
    );

    formValueForValidation = {
      ...formValue,
      anmeldezeitStunde: 0,
      anmeldezeitMinuten: 0,
      abmeldezeitStunde: endHour,
      abmeldezeitMinuten: endMinute,
      datum: formValue.datum instanceof Date
        ? formValue.datum
        : this.dateParserService.parseGermanDate(formValue.datum)
    };
  } else {
    formValueForValidation = {
      ...formValue,
      datum: formValue.datum instanceof Date
        ? formValue.datum
        : this.dateParserService.parseGermanDate(formValue.datum)
    };
  }

  if (formValueForValidation.datum instanceof Date) {
    formValueForValidation.datum.setHours(0, 0, 0, 0);
  }

  if (this.abschlussInfo && this.abschlussInfo.naechsterBuchbarerTag) {
      const selectedDate: Date = formValueForValidation.datum;
      const naechsterBuchbarerTag = new Date(this.abschlussInfo.naechsterBuchbarerTag);

      if (selectedDate < naechsterBuchbarerTag) {
        this.snackBar.open(
          `Dieser Zeitraum ist bereits abgeschlossen. Frühestens ab ${this.abschlussInfo.naechsterBuchbarerTag} buchbar.`,
          'Schließen',
          { duration: 5000, verticalPosition: 'top' }
        );
        return;
      }
    }
      const validationResult = this.validateTimeEntryOverlap(formValueForValidation, isDurationBased);
  if (!validationResult.isValid) {
    this.notificationService.showError(validationResult.errorMessage || 'Ungültige Zeitangaben');
    return; // 🔥 STOP HERE - don't save!
  }

  // Only save if validation passed
  if (this.isCreatingNew || this.isNewlyCreated) {
    this.saveNewEntry(formValueForValidation, isDurationBased);

    if (isDurationBased) {
      this.resetAlarmState();
    }
    return;
  }

  this.notificationService.saved();
  this.isEditing = false;
  this.isNewlyCreated = false;
  this.formValidationService.disableAllFormControls(this.taetigkeitForm);
}
private saveNewEntry(formValue: any, isDurationBased: boolean = false): void {
  const selectedDate = this.parseGermanDate(formValue.datum);
  if (!selectedDate) {
    this.notificationService.invalidDate();
    return;
  }

  const timeRange = this.activityFormService.buildTimeRange(
    formValue.anmeldezeitStunde,
    formValue.anmeldezeitMinuten,
    formValue.abmeldezeitStunde,
    formValue.abmeldezeitMinuten
  );

  const gebuchtTime = this.activityFormService.calculateGebuchtTime(
    formValue.anmeldezeitStunde,
    formValue.anmeldezeitMinuten,
    formValue.abmeldezeitStunde,
    formValue.abmeldezeitMinuten
  );

  const { loginDate, logoffDate } = this.activityFormService.createLoginLogoffDates(
    selectedDate,
    formValue.anmeldezeitStunde,
    formValue.anmeldezeitMinuten,
    formValue.abmeldezeitStunde,
    formValue.abmeldezeitMinuten
  );

  // 🔥 Create the DTO for backend
  const dto: ApiTaetigkeitsbuchung = {
    minutenDauer: this.calculateMinutenDauer(
      formValue.anmeldezeitStunde,
      formValue.anmeldezeitMinuten,
      formValue.abmeldezeitStunde,
      formValue.abmeldezeitMinuten
    ),
    taetigkeit: formValue.taetigkeit,
    buchungspunkt: formValue.buchungspunkt,
    jiraTicket: formValue.jiraTicket || '',
    anmerkung: formValue.anmerkung || '',
    datum: this.formatDateForBackend(selectedDate),
    buchungsart: formValue.buchungsart,
    stempelzeit: {
      login: loginDate.toISOString(),
      logoff: logoffDate.toISOString(),
      zeitTyp: formValue.buchungsart,
      anmerkung: formValue.anmerkung || ''
    }
  };

  // Get the buchungspunktId from the selected buchungspunkt
  const buchungspunktId = formValue.buchungspunkt?.id || '';

  const personId = this.route.snapshot.paramMap.get('id') || '';
  this.dummyService.createTaetigkeitsbuchung(
    dto,
    buchungspunktId,
    personId
  ).subscribe({
    next: (savedEntry) => {
      const newStempelzeitData = savedEntry.stempelzeit || {
        login: loginDate.toISOString(),
        logoff: logoffDate.toISOString(),
        zeitTyp: formValue.buchungsart,
        anmerkung: formValue.anmerkung || '',
        // id: savedEntry.stempelzeit?.id
      };

      const newActivityData = this.activityFormService.createActivityData(
        formValue,
        gebuchtTime,
        isDurationBased
      );

      this.treeManagementService.addActivityToTree(
        this.dataSource.data,
        this.treeControl,
        selectedDate,
        newActivityData,
        timeRange,
        newStempelzeitData
      );

      this.dataSource.data = [...this.dataSource.data];
      this.isNewlyCreated = false;
      this.isCreatingNew = false;
      this.isEditing = false;

      setTimeout(() => {
        const newNode = this.treeManagementService.findNewlyCreatedNode(
          this.treeControl.dataNodes,
          formValue,
          timeRange
        );

        if (newNode) {
          this.selectedNode = newNode;
          this.activityFormService.populateActivityForm(this.taetigkeitForm, newNode.formData);
          this.formValidationService.disableAllFormControls(this.taetigkeitForm);
          this.cdr.detectChanges();
        }
      }, 150);

      this.notificationService.created();
    },
    error: (err) => {
      console.error('Create Taetigkeitsbuchung failed', err);
      this.notificationService.showError('Fehler beim Erstellen der Buchung');
    }
  });
}

private calculateMinutenDauer(startHour: number, startMin: number, endHour: number, endMin: number): number {
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  return endTotalMin - startTotalMin;
}

private formatDateForBackend(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
  onAlarmClick(node: FlatNode, event?: Event) {
    if (this.isCreatingNew || this.isNewlyCreated || this.isEditing) {
      this.isCreatingNew = false;
      this.isNewlyCreated = false;
      this.isEditing = false;
      this.taetigkeitForm.reset();
      this.taetigkeitForm.disable();
    }

    if (event) {
      event.stopPropagation();
    }

    if (node.level === 1) {
      this.alarmNode = node;
      this.isCreatingNewThirdLevel = true;
      this.showRightPanelAlarmActions = true;
      this.createNewThirdLevelForm(node);
    }
  }

  createNewThirdLevelForm(parentNode: FlatNode) {
    const parentDate = this.dateParserService.getDateFromFormattedDay(parentNode.dayName || '');
    this.activityFormService.initializeAlarmForm(this.alarmForm, parentDate);
    console.log('Alarm form initialized:', this.alarmForm.value);
  }

  approveNewThirdLevel() {
    if (!this.alarmForm || !this.alarmNode) return;

    // Basic form validation only
    this.formValidationService.validateAllFields(this.alarmForm);

    if (!this.alarmForm.valid) {
      this.showAlarmFormValidationErrors();
      return;
    }

    const alarmValue = this.alarmForm.value;

    const formValue = {
      datum: alarmValue.datum,
      buchungsart: alarmValue.buchungsart,
      produkt: alarmValue.produkt,
      produktposition: alarmValue.produktposition,
      buchungspunkt: alarmValue.buchungspunkt,
      taetigkeit: alarmValue.taetigkeit,
      durationStunde: alarmValue.durationStunde || 0,
      durationMinuten: alarmValue.durationMinuten || 0,
      anmerkung: alarmValue.anmerkung || '',
      jiraTicket: alarmValue.jiraTicket || ''
    };

    this.isCreatingNew = true;
    this.isNewlyCreated = true;
    this.validate(formValue);
  }

  cancelNewThirdLevel() {
    this.resetAlarmState();
  }

  private resetAlarmState() {
    this.isCreatingNewThirdLevel = false;
    this.alarmNode = null;
    this.showRightPanelAlarmActions = false;
    this.alarmForm.reset();
  }

  private showAlarmFormValidationErrors(): void {
    const errors = this.formValidationService.getValidationErrors(
      this.alarmForm,
      this.fieldDisplayMap
    );
    this.notificationService.showValidationErrors(errors);
  }

 async deleteEntry() {
  if (this.selectedNode && !this.isCreatingNew) {
    const nodeName = this.selectedNode.name || '';
    const entryDate = this.activityFormService.getEntryDateString(this.selectedNode);

    const confirmed = await this.dialogService.showDeleteConfirmation(nodeName, entryDate);

    if (!confirmed) {
      console.log('Delete operation cancelled by user');
      return;
    }

    // 🔥 Get the stempelzeit ID
    const stempelzeitId = this.selectedNode.stempelzeitData?.id;
    if (!stempelzeitId) {
      this.notificationService.showError('Keine ID zum Löschen gefunden');
      return;
    }

    // 🔥 Create DTO for delete
    const dto: ApiTaetigkeitsbuchung = {
      stempelzeit: this.selectedNode.stempelzeitData,
      minutenDauer: 0,
      anmerkung: ''
    };

    // 🔥 Call DummyService (same pattern as bereitschaftszeiten)
    this.dummyService.updateTaetigkeitsbuchung(
      stempelzeitId,
      dto,
      'delete'
    ).subscribe({
      next: () => {
        if (this.deleteNodeFromTree()) {
          this.notificationService.deleted();
          this.selectedNode = null;
          this.isEditing = false;
          this.taetigkeitForm.reset();
        }
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.notificationService.showError('Fehler beim Löschen');
      }
    });
  } else if (this.isCreatingNew) {
    this.cancelFormChanges();
  }
}

  private deleteNodeFromTree(): boolean {
    if (this.treeManagementService.deleteNodeFromTree(this.dataSource.data, this.selectedNode)) {
      this.dataSource.data = [...this.dataSource.data];
      return true;
    }
    return false;
  }
  getHour(timeType: 'anmeldezeit' | 'abmeldezeit'): number {
    return this.timeUtilityService.getHour(this.taetigkeitForm, timeType);
  }

  getMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): number {
    return this.timeUtilityService.getMinute(this.taetigkeitForm, timeType);
  }

  increaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing) return;
    this.timeUtilityService.increaseHour(this.taetigkeitForm, timeType);
  }

  decreaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing) return;
    this.timeUtilityService.decreaseHour(this.taetigkeitForm, timeType);
  }

  increaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing) return;
    this.timeUtilityService.increaseMinute(this.taetigkeitForm, timeType);
  }

  decreaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    if (!this.isEditing) return;
    this.timeUtilityService.decreaseMinute(this.taetigkeitForm, timeType);
  }

  validateTime(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
    this.timeUtilityService.validateTime(this.taetigkeitForm, timeType);
  }

  getAlarmHour(): number {
    return this.timeUtilityService.getHour(this.alarmForm, 'duration');
  }

  getAlarmMinute(): number {
    return this.timeUtilityService.getMinute(this.alarmForm, 'duration');
  }

  increaseAlarmHour() {
    this.timeUtilityService.increaseHour(this.alarmForm, 'duration');
  }

  decreaseAlarmHour() {
    this.timeUtilityService.decreaseHour(this.alarmForm, 'duration');
  }

  increaseAlarmMinute() {
    this.timeUtilityService.increaseMinute(this.alarmForm, 'duration');
  }

  decreaseAlarmMinute() {
    this.timeUtilityService.decreaseMinute(this.alarmForm, 'duration');
  }

  validateAlarmTime() {
    this.timeUtilityService.validateTime(this.alarmForm, 'duration');
  }

  toggleEdit(): void {
    if (this.isEditing) {
      if (this.selectedNode?.level === 0) {
        this.saveMonthChanges();
      } else if (this.selectedNode?.level === 1) {
        this.saveDayChanges();
      } else if (this.selectedNode?.level === 2) {
        this.saveForm();
      }
      this.formValidationService.disableAllFormControls(this.taetigkeitForm);
    } else {
      this.isEditing = true;
      this.formValidationService.enableAllFormControls(this.taetigkeitForm, ['gestempelt', 'gebucht']);
    }
    this.cdr.detectChanges();
  }

  saveMonthChanges(): void {
    if (this.monthForm.valid && this.selectedNode?.level === 0) {
      const formValue = this.monthForm.value;

      this.selectedNode.hasNotification = formValue.abgeschlossen;
      this.selectedNode.gebuchtTotal = formValue.gebuchtTotal;

      this.notificationService.monthSaved();
      this.isEditing = false;
      this.formValidationService.disableAllFormControls(this.monthForm);
      this.dataSource.data = [...this.dataSource.data];
    }
  }

  saveDayChanges(): void {
    if (this.dayForm.valid && this.selectedNode?.level === 1) {
      const formValue = this.dayForm.value;

      this.selectedNode.hasNotification = formValue.abgeschlossen;
      this.selectedNode.gestempelt = formValue.gestempelt;
      this.selectedNode.gebucht = formValue.gebucht;

      if (formValue.stempelzeiten && this.selectedNode.stempelzeitenList) {
        this.selectedNode.stempelzeitenList[0] = formValue.stempelzeiten;
      }

      this.notificationService.daySaved();
      this.isEditing = false;
      this.formValidationService.disableAllFormControls(this.dayForm);
      this.dataSource.data = [...this.dataSource.data];
    }
  }

  addTimeEntryFromHeader() {
    if (this.showRightPanelAlarmActions || this.isCreatingNewThirdLevel) {
      this.resetAlarmState();
    }
    if (this.isCreatingNew || this.isNewlyCreated) {
      this.cancelFormChanges();
    }

    const currentDate = this.dateParserService.getCurrentDateGerman();

    this.isCreatingNew = true;
    this.isNewlyCreated = true;
    this.showRightPanelAlarmActions = false;
    this.isEditing = true;

    this.activityFormService.initializeNewEntryForm(this.taetigkeitForm, currentDate);
    this.formValidationService.enableAllFormControls(this.taetigkeitForm, ['gestempelt', 'gebucht']);

    this.selectedNode = this.activityFormService.getDefaultNewEntryNode(currentDate) as FlatNode;

    this.taetigkeitForm.markAsPristine();

    console.log('New entry form opened from header');
  }

  cancelFormChanges() {
    if (this.isCreatingNewThirdLevel) {
      this.cancelNewThirdLevel();
      return;
    }

    if (this.isCreatingNew || this.isNewlyCreated) {
      this.selectedNode = null;
      this.isEditing = false;
      this.isCreatingNew = false;
      this.isNewlyCreated = false;
      this.taetigkeitForm.reset();
    } else if (this.selectedNode) {
      if (this.selectedNode.level === 2 && this.selectedNode.formData) {
        this.activityFormService.populateActivityForm(this.taetigkeitForm, this.selectedNode.formData);
      } else if (this.selectedNode.level === 0) {
        this.activityFormService.populateMonthForm(this.monthForm, this.selectedNode);
      } else if (this.selectedNode.level === 1) {
        this.activityFormService.populateDayForm(this.dayForm, this.selectedNode);
      }

      this.isEditing = false;
      this.isNewlyCreated = false;

      if (this.selectedNode.level === 2) {
        this.taetigkeitForm.get('jiraTicket')?.disable();
      }
    }
  }

private validateTimeEntryOverlap(
  formValue: any,
  isDurationBased: boolean = false
): { isValid: boolean; errorMessage?: string } {
  const excludeId = (this.isCreatingNew || this.isNewlyCreated)
    ? undefined
    : this.selectedNode?.stempelzeitData?.id;

  return this.timeOverlapService.validateTimeEntryOverlap(
    formValue,
    this.dataSource.data,
    excludeId,
    isDurationBased
  );
}


  private showValidationErrors(): void {
    const errors = this.formValidationService.getValidationErrors(
      this.taetigkeitForm,
      this.fieldDisplayMap
    );
    this.notificationService.showValidationErrors(errors);
  }

  getFullDayOfWeekFromNode(node: FlatNode | null): string {
    return this.dateParserService.getFullDayOfWeekFromNode(node);
  }

  getDateDisplayFromNode(node: FlatNode | null): string {
    if (!node) return '';
    const sourceString = node.dayName || node.name || '';
    if (!sourceString) return '';

    const dateMatch = sourceString.match(/(\w{2})\.\s+(\d{1,2})\.\s+(\w+)/);
    if (dateMatch) {
      const [, , day, monthName] = dateMatch;
      return `${day.padStart(2, '0')}. ${monthName}`;
    }
    return '';
  }

  parseGermanDate(value: string | Date): Date | null {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    if (typeof value === 'string') {
      const parts = value.split('.');
      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);
        const date = new Date(year, month, day);
        return isNaN(date.getTime()) ? null : date;
      }
    }

    return null;
  }
}
