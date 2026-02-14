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
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
// import { BereitschaftszeitenService } from '../../../services/bereitschaftszeiten.service';
import { DummyService } from '../../../services/dummy.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FormValidationService } from '../../../services/utils/form-validation.service';
import { TimeUtilityService } from '../../../services/utils/time-utility.service';
import { TreeNodeService } from '../../../services/utils/tree-node.service';
import { TimeOverlapService } from '../../../services/utils/time-overlap.service';
// import { TreeExpansionService } from '../../../services/utils/tree-expansion.service';
import { DateParserService } from '../../../services/utils/date-parser.service';
import { ApiStempelzeit } from '../../../models-2/ApiStempelzeit';
import { ApiZeitTyp } from '../../../models-2/ApiZeitTyp';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../../services/custom-date-adapter.service';
import { TreeNodeManagementService } from "../../../services/utils/tree-node-management.service";
import { TreeBuilderService } from '../../../services/utils/tree-builder.service';
import { DateUtilsService } from "../../../services/utils/date-utils.service";
import { ApiAbschlussInfo } from '../../../models-2/ApiAbschlussInfo';
import { TaetigkeitNode } from '../../../models/TaetigkeitNode';
import { FlatNode } from '../../../models/Flat-node';
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
//////TESTING///////


// interface formData {
//   startDatum: Date,
//   startStunde: number,
//   startMinuten: number,
//   endeDatum: Date,
//   endeStunde: number,
//   endeMinuten: number,
//   anmerkung: string
// }

@Component({
  selector: 'app-bereitschaftszeiten-details',
  imports: [
    MatProgressSpinnerModule, MatTreeModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
    ReactiveFormsModule, CommonModule, MatCheckbox, ConfirmationDialogComponent, MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
  ]

  ,
  templateUrl: './bereitschaftszeiten-details.component.html',
  styleUrl: './bereitschaftszeiten-details.component.scss'
})
export class BereitschaftszeitenDetailsComponent {

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  isCreatingNewThirdLevel = false;
  alarmNode: FlatNode | null = null;
  showRightPanelAlarmActions = false;

  private transformer = (node: TaetigkeitNode, level: number): FlatNode => ({
    expandable: -level === 0 || level === 1,
    name: node.name,
    level: level,
    hasEntries: node.hasEntries ?? false,
    hasNotification: node.hasNotification || false,
    formData: node.formData,
    stempelzeitData: node.stempelzeitData,
    monthName: node.monthName,
    // gebuchtTotal: node.gebuchtTotal,
    dayName: node.dayName,
    gestempelt: node.gestempelt,
    // gebucht: node.gebucht,
    // stempelzeitenList: node.stempelzeitenList,
    // gebuchtTime: node.gebuchtTime,
    timeRange: node.timeRange,
    hasAlarm: node.hasAlarm || false,
    alarmData: node.alarmData || null
  });

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  bereitschaftForm: FormGroup;
  alarmForm: FormGroup;
  selectedNode: FlatNode | null = null;
  isEditing = false;
  isLoading = true;
  isCreatingNew = false;
  isNewlyCreated = false;
  private clickTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly DOUBLE_CLICK_DELAY = 250;
  private clickCount = 0;
  personId!: string;
  abschlussInfo: ApiAbschlussInfo | null = null;

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
    // private dummyService1: BereitschaftszeitenService,
    private formValidationService: FormValidationService,
    private timeUtilityService: TimeUtilityService,
    private treeNodeService: TreeNodeService,
    private timeOverlapService: TimeOverlapService,
    // private treeExpansionService: TreeExpansionService,
    private dateParserService: DateParserService,
    private treeNodeManagementService: TreeNodeManagementService,
    private treeBuilderService: TreeBuilderService,
    private dateUtilsService: DateUtilsService
  ) {
    this.bereitschaftForm = this.createBereitschaftForm();
    this.alarmForm = this.createAlarmForm();
  }

  ngOnInit() {
    const defaultUserId = '1';
    this.loadData(defaultUserId);
    this.personId = defaultUserId;
  }

  private createBereitschaftForm(): FormGroup {
    return this.fb.group({
      startDatum: [null, Validators.required],
      startStunde: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      startMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      endeDatum: [null, Validators.required],
      endeStunde: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      endeMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      anmerkung: ['']
    });
  }

  private createAlarmForm(): FormGroup {
    return this.fb.group({
      startDatum: [null, Validators.required],
      startStunde: [0],
      startMinuten: [0],
      endeDatum: [null, Validators.required],
      endeStunde: [0],
      endeMinuten: [0],
      anmerkung: ['']
    });
  }

loadData(personId: string) {
  this.isLoading = true;
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;

  this.dummyService.getPersonStempelzeitenNoAbwesenheit(personId, startDate, endDate).subscribe({
    next: (stempelzeiten) => {
      const filtered = stempelzeiten.filter((s: ApiStempelzeit) =>
        s.zeitTyp && s.zeitTyp.toUpperCase() === ApiZeitTyp.BEREITSCHAFT.toUpperCase()
      );
      const baseTreeData = this.treeBuilderService.generateCurrentAndPreviousMonth();
      const mergedTreeData = this.mergeApiDataIntoTree(baseTreeData, filtered);

      this.dataSource.data = mergedTreeData;
      this.isLoading = false;

      this.treeBuilderService.expandCurrentAndLastMonth(this.treeControl);
    },
    error: () => this.isLoading = false
  });

  this.dummyService.getPersonAbschlussInfo(personId).subscribe({
    next: (info) => {
      this.abschlussInfo = info;
    }
  });
}
private mergeApiDataIntoTree(baseTree: TaetigkeitNode[], apiData: ApiStempelzeit[]): TaetigkeitNode[] {
  if (!apiData || apiData.length === 0) {
    return baseTree;
  }

  const apiTreeData = this.treeBuilderService.transformToTreeStructure(apiData);
  for (const apiMonth of apiTreeData) {
    const baseMonth = baseTree.find(m => m.monthName === apiMonth.monthName);

    if (baseMonth && apiMonth.children) {
      for (const apiDay of apiMonth.children) {
        const baseDay = baseMonth.children?.find(d => d.dayName === apiDay.dayName);

        if (baseDay) {
          baseDay.children = apiDay.children || [];
          baseDay.hasEntries = apiDay.hasEntries || false;
          baseDay.gestempelt = apiDay.gestempelt || '00:00';
          baseDay.hasAlarm = apiDay.hasAlarm || false;
          baseDay.alarmData = apiDay.alarmData || null;
        }
      }

      baseMonth.hasEntries = baseMonth.children?.some(d => d.hasEntries) || false;
    }
  }

  return baseTree;
}
  onNodeClick(node: FlatNode, event?: MouseEvent) {
    this.clickCount++;

    if (this.clickCount === 1) {

      this.clickTimeout = setTimeout(() => {

        this.handleSingleClick(node);
        this.clickCount = 0;
      }, this.DOUBLE_CLICK_DELAY);
    }
  }

  onNodeDoubleClick(node: FlatNode, event?: MouseEvent) {

    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    this.clickCount = 0;
    this.handleDoubleClick(node);
  }

  private handleSingleClick(node: FlatNode) {
    if (this.showRightPanelAlarmActions && node !== this.alarmNode) {
      this.resetAlarmState();
    }

    this.isNewlyCreated = false;
    this.isCreatingNew = false;
    this.selectedNode = node;

    if (node.level === 2 && node.formData) {
      this.populateForm(node.formData);
    }
    this.disableAllFormControls();
  }

  private handleDoubleClick(node: FlatNode) {
    if (node.expandable) {
      if (this.treeControl.isExpanded(node)) {
        this.treeControl.collapse(node);
      } else {
        this.treeControl.expand(node);
      }
    }


    this.handleSingleClick(node);
  }

  populateForm(formData: any) {
    if (!this.showRightPanelAlarmActions) {
      this.bereitschaftForm.patchValue(formData);
    }
  }

  onAlarmClick(node: FlatNode, event: Event) {
    event.stopPropagation();
     if (this.isCreatingNew || this.isNewlyCreated || this.isEditing) {
    this.isCreatingNew = false;
    this.isNewlyCreated = false;
    this.isEditing = false;
    this.bereitschaftForm.reset();
    this.bereitschaftForm.disable();
  }
    this.alarmNode = node;
    this.isCreatingNewThirdLevel = true;
    this.showRightPanelAlarmActions = true;
    this.createNewThirdLevelForm(node);
  }



  /////////////////////////CREATION ///////////////////////

  createNewThirdLevelForm(parentNode: FlatNode) {
    this.alarmForm.reset();
    const parentDate = this.dateParserService.getDateFromFormattedDay(parentNode.dayName || '');
    this.alarmForm.patchValue(this.getDefaultFormValue(parentDate));

  }
  private getDefaultFormValue(date: Date) {
    return {
      startDatum: date,
      startStunde: 0,
      startMinuten: 0,
      endeDatum: date,
      endeStunde: 0,
      endeMinuten: 0,
      anmerkung: ''
    };
  }

approveNewThirdLevel() {
  if (!this.alarmForm.valid) {
    this.showAlarmFormValidationErrors();
    return;
  }

  const alarmValue = this.alarmForm.value;

  const formValue = {
    startDatum: alarmValue.startDatum,
    endeDatum: alarmValue.endeDatum,
    startStunde: alarmValue.startStunde,
    startMinuten: alarmValue.startMinuten,
    endeStunde: alarmValue.endeStunde,
    endeMinuten: alarmValue.endeMinuten,
    anmerkung: alarmValue.anmerkung || ''
  };

  this.validate(formValue);

}

private validate(formValue: any): void {
  // Abschluss check
  if (this.abschlussInfo && this.abschlussInfo.naechsterBuchbarerTag) {
    const startDatum: Date = formValue.startDatum;
    const naechsterBuchbarerTag = new Date(this.abschlussInfo.naechsterBuchbarerTag);

    if (startDatum < naechsterBuchbarerTag) {
      this.snackBar.open(
        `Dieser Zeitraum ist bereits abgeschlossen. Frühestens ab ${this.abschlussInfo.naechsterBuchbarerTag} buchbar.`,
        'Schließen',
        { duration: 5000, verticalPosition: 'top' }
      );
      return;
    }
  }

  // Overlap check
  const excludeId = this.selectedNode?.stempelzeitData?.id;
  const validationResult = this.timeOverlapService.validateBereitschaftEntry(
    formValue,
    this.dataSource.data,
    excludeId
  );

  if (!validationResult.isValid) {
    this.snackBar.open(validationResult.errorMessage!, 'Schließen', {
      duration: 5000,
      verticalPosition: 'top'
    });
    return;
  }
  this.saveNewEntry(formValue);
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
    const errors = this.formValidationService.getValidationErrors(this.alarmForm, this.fieldDisplayMap);
    if (errors.length > 0) {
      const errorMessage = this.formValidationService.formatValidationErrors(errors);
      this.snackBar.open(errorMessage, 'Schließen', { duration: 5000, verticalPosition: 'top' });
    }
  }
  private addActivityToDay(dayNode: TaetigkeitNode, formData: any, timeRange: string, gestempeltTime: string, stempelzeitData?: ApiStempelzeit): void {
    if (!dayNode.children) dayNode.children = [];
    const newChild: TaetigkeitNode = {
      name: `Bereitschaft ${timeRange}`,
      gestempeltTime: gestempeltTime,
      timeRange: timeRange,
      formData: formData,
      stempelzeitData: stempelzeitData,
      children: [],
      hasAlarm: false,
      alarmData: null
    };
    dayNode.children.push(newChild);
    this.treeNodeService.updateParentTimes(dayNode);
    dayNode.hasEntries = true;
    this.treeNodeService.recalculateDayTotals(dayNode);

  }

 addTimeEntryFromHeader() {
  if (this.showRightPanelAlarmActions || this.isCreatingNewThirdLevel) {
    this.resetAlarmState();
  }

  if (this.isCreatingNew || this.isNewlyCreated) this.cancelFormChanges();

  const currentTime = new Date();
  this.isCreatingNew = true;
  this.isNewlyCreated = true;
  this.showRightPanelAlarmActions = false;
  this.isEditing = true;

  this.bereitschaftForm.reset();
  this.bereitschaftForm.enable();
  const today = new Date();

  this.bereitschaftForm.patchValue(this.getDefaultFormValue(today));
  this.selectedNode = {
    level: 2,
    expandable: false,
    name: 'Neue Bereitschaft',
    hasNotification: false,
    formData: {
      startDatum: today,
      startStunde: 0,
      startMinuten: 0,
      endeDatum: today,
      endeStunde: 0,
      endeMinuten: 0,
      anmerkung: ''
    }
  } as FlatNode;
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
      this.bereitschaftForm.reset();
    } else if (this.selectedNode) {
      if (this.selectedNode.level === 2 && this.selectedNode.formData) {
        this.populateForm(this.selectedNode.formData);
      }
      this.isEditing = false;
    }
  }
  saveBereitschaft() {
    this.formValidationService.validateAllFields(this.bereitschaftForm);
    if (!this.bereitschaftForm.valid) {
      this.showValidationErrors();
      return;
    }

    const formValue = this.bereitschaftForm.getRawValue();
    if (this.abschlussInfo && this.abschlussInfo.naechsterBuchbarerTag) {
      const startDatum: Date = formValue.startDatum;
      const naechsterBuchbarerTag = new Date(this.abschlussInfo.naechsterBuchbarerTag);

      if (startDatum < naechsterBuchbarerTag) {
        this.snackBar.open(
          `Dieser Zeitraum ist bereits abgeschlossen. Frühestens ab ${this.abschlussInfo.naechsterBuchbarerTag} buchbar.`,
          'Schließen',
          { duration: 5000, verticalPosition: 'top' }
        );
        return;
      }
    }
    const excludeId = this.selectedNode?.stempelzeitData?.id;
    const validationResult = this.timeOverlapService.validateBereitschaftEntry(
      formValue,
      this.dataSource.data,
      excludeId
    );

    if (!validationResult.isValid) {
      this.snackBar.open(validationResult.errorMessage!, 'Schließen', {
        duration: 5000,
        verticalPosition: 'top'
      });
      return;
    }

    if (this.isCreatingNew || this.isNewlyCreated) {
  this.validate(formValue);
}


    this.snackBar.open('Änderungen gespeichert!', 'Schließen', {
      duration: 3000,
      verticalPosition: 'top'
    });



    this.isEditing = false;
    this.isCreatingNew = false;
    this.isNewlyCreated = false;
    this.disableAllFormControls();
  }



  private saveNewEntry(formValue: any): void {
    const startDate: Date = formValue.startDatum
    const endDate: Date = formValue.endeDatum;
    if (!startDate || !endDate) return;

    const loginDate = new Date(startDate);
    loginDate.setHours(formValue.startStunde, formValue.startMinuten, 0, 0);

    const logoffDate = new Date(endDate);
    logoffDate.setHours(formValue.endeStunde, formValue.endeMinuten, 0, 0);

    const gebuchtTime = this.timeUtilityService.calculateGestempelt(loginDate, logoffDate);
    const timeRange = `${this.timeUtilityService.formatTime(loginDate)} - ${this.timeUtilityService.formatTime(logoffDate)}`;

    const dto: ApiStempelzeit = {
      login: loginDate.toISOString(),
      logoff: logoffDate.toISOString(),
      zeitTyp: ApiZeitTyp.BEREITSCHAFT,
      anmerkung: formValue.anmerkung || ''
    };


    this.dummyService
      .createBereitschaft(this.personId, dto)
      .subscribe({
        next: (savedEntries) => {
          const savedEntry = savedEntries.find(
            e => e.login === dto.login && e.logoff === dto.logoff
          ) || savedEntries[savedEntries.length - 1];

          const monthYear = this.timeUtilityService.getMonthYearString(startDate);
          const monthNode = this.treeNodeManagementService.findOrCreateMonthNode(
            this.dataSource.data, monthYear,
            (my) => this.timeUtilityService.parseMonthYearString(my)
          );
          const dayKey = this.timeUtilityService.formatDayName(startDate);
          const dayNode = this.treeNodeManagementService.findOrCreateDayNode(
            monthNode, dayKey, startDate,
            (dayStr) => this.dateParserService.getDateFromFormattedDay(dayStr)
          );
          this.addActivityToDay(dayNode, formValue, timeRange, gebuchtTime, savedEntry);

          this.dataSource.data = [...this.dataSource.data];
          this.treeNodeManagementService.expandParentNodesForNewEntry(this.treeControl, monthYear, dayKey);

          setTimeout(() => {
            const newNode = this.treeControl.dataNodes.find(node =>
              node.level === 2 &&
              node.formData &&
              node.formData.startDatum === formValue.startDatum &&
              node.timeRange === timeRange
            );
            if (newNode) {
              this.selectedNode = newNode;
              this.populateForm(newNode.formData);
              this.disableAllFormControls();
              this.cdr.detectChanges();
            }
          }, 150);
        },
        error: err => {
          console.error('Create Bereitschaft failed', err);
        }
      });
  }

  private showValidationErrors(): void {
    const errors = this.formValidationService.getValidationErrors(this.bereitschaftForm, this.fieldDisplayMap);
    if (errors.length > 0) {
      const errorMessage = this.formValidationService.formatValidationErrors(errors);
      this.snackBar.open(errorMessage, 'Schließen', { duration: 5000, verticalPosition: 'top' });
    }
  }
  /////////////////////////DELETE///////////////////////////////////////
  async deleteEntry() {
    if (!this.selectedNode || this.isCreatingNew) return;

    const confirmed = await this.showDeleteConfirmation(this.selectedNode.name || '');
    if (!confirmed) return;

    const id = this.selectedNode.stempelzeitData?.id;
    if (!id) return;

    this.dummyService.deleteBereitschaft(id).subscribe({
      next: () => {
        this.treeNodeService.deleteNodeFromTree(
          this.dataSource.data,
          this.selectedNode!
        );

        this.dataSource.data = [...this.dataSource.data];
        this.snackBar.open('Eintrag gelöscht!', 'Schließen', { duration: 3000 });

        this.selectedNode = null;
        this.isEditing = false;
        this.bereitschaftForm.reset();
      },
      error: err => {
        console.error('Delete failed', err);
        this.snackBar.open('Fehler beim Löschen', 'Schließen', { duration: 3000 });
      }
    });
  }
  private async showDeleteConfirmation(entryName: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {
        title: 'Löschen bestätigen',
        message: `Wollen Sie den Eintrag "${entryName}" wirklich löschen?`,
        confirmText: 'Ja',
        cancelText: 'Nein'
      }
    });
    return await dialogRef.afterClosed().toPromise() === true;
  }

  disableAllFormControls(): void {
    this.bereitschaftForm.disable();
  }

  enableAllFormControls(): void {
    this.bereitschaftForm.enable();
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  goBackToList() {
    this.router.navigate(['/standby-two']);
  }

  onCheckboxChange(event: MatCheckboxChange): void {
    if (this.selectedNode && this.isEditing) {
      this.selectedNode.hasNotification = event.checked;
    }
  }
  adjustTime(type: 'start' | 'end', unit: 'hour' | 'minute', amount: number) {
    const isAlarmMode = this.showRightPanelAlarmActions;
    const isEditMode = this.isEditing || this.isCreatingNew || this.isNewlyCreated;

    if (!isAlarmMode && !isEditMode) return;

    const form = isAlarmMode ? this.alarmForm : this.bereitschaftForm;

    const controlNameHour = type === 'start' ? 'startStunde' : 'endeStunde';
    const controlNameMinute = type === 'start' ? 'startMinuten' : 'endeMinuten';

    const currentHour = form.get(controlNameHour)?.value || 0;
    const currentMinute = form.get(controlNameMinute)?.value || 0;
    const isHour24 = currentHour === 24;

    if (unit === 'hour') {
      const result = this.timeUtilityService.adjustTime(currentHour, currentMinute, 'hour', amount, isHour24);
      form.get(controlNameHour)?.setValue(result.hour);
      form.get(controlNameMinute)?.setValue(result.minute);
    } else {
      const result = this.timeUtilityService.adjustTime(currentHour, currentMinute, 'minute', amount, isHour24);
      form.get(controlNameHour)?.setValue(result.hour);
      form.get(controlNameMinute)?.setValue(result.minute);
    }
  }

  private finalizeNewEntry(newNode: FlatNode): void {
    this.selectedNode = newNode;
    this.isCreatingNew = false;
    this.isNewlyCreated = false;
    this.isEditing = false;
    this.populateForm(newNode.formData);
    this.disableAllFormControls();
    this.cdr.detectChanges();
  }
  ngOnDestroy() {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
  }
  getFullDayOfWeek(node: FlatNode | null): string {
    return this.dateParserService.getFullDayOfWeekFromNode(node);
  }

  getDateDisplay(node: FlatNode | null): string {
    if (!node) return '';
    return this.dateUtilsService.getDateDisplayFromNode(node);
  }

}

