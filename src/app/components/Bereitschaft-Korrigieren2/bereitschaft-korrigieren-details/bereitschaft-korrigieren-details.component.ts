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
import { MatCheckbox } from "@angular/material/checkbox";

import { DummyService } from '../../../services/dummy.service';
// import{BereitschaftKorrigierenService} from '../../../services/bereitschaft-korrigieren.service'
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FlatNode } from '../../../models/Flat-node';
import { TaetigkeitNode } from '../../../models/TaetigkeitNode';
import { FormValidationService } from '../../../services/utils/form-validation.service';
import { TimeUtilityService } from '../../../services/utils/time-utility.service';
import { TreeNodeService } from '../../../services/utils/tree-node.service';
import { TimeOverlapService } from '../../../services/utils/time-overlap.service';
import { TreeExpansionService } from '../../../services/utils/tree-expansion.service';
import { DateParserService } from '../../../services/utils/date-parser.service';
import { ApiStempelzeit } from '../../../models-2/ApiStempelzeit';
import { ApiZeitTyp } from '../../../models-2/ApiZeitTyp';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../../services/custom-date-adapter.service';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-bereitschaft-korrigieren-details',
  imports: [
    MatProgressSpinnerModule, MatTreeModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
    ReactiveFormsModule, CommonModule, MatCheckbox, ConfirmationDialogComponent,MatDatepickerModule,
  MatNativeDateModule,MatDatepickerModule,
    MatNativeDateModule
],
providers: [
  { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
  { provide: DateAdapter, useClass: CustomDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
]
,

  templateUrl: './bereitschaft-korrigieren-details.component.html',
  styleUrl: './bereitschaft-korrigieren-details.component.scss'
})
export class BereitschaftKorrigierenDetailsComponent implements OnInit {


   treeControl = new FlatTreeControl<FlatNode>(
     node => node.level,
     node => node.expandable
   );

   isCreatingNewThirdLevel = false;
   alarmNode: FlatNode | null = null;
   showRightPanelAlarmActions = false;
private transformer = (node: TaetigkeitNode, level: number): FlatNode => ({
  expandable: level === 0 || level === 1,
  name: node.name,
  level: level,

  hasEntries: node.hasEntries ?? false,

  hasNotification: node.hasNotification || false,
  formData: node.formData,
  stempelzeitData: node.stempelzeitData,
  monthName: node.monthName,
  gebuchtTotal: node.gebuchtTotal,
  dayName: node.dayName,
  gestempelt: node.gestempelt,
  gebucht: node.gebucht,
  stempelzeitenList: node.stempelzeitenList,
  gebuchtTime: node.gebuchtTime,
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
   monthForm: FormGroup;
   dayForm: FormGroup;

   selectedNode: FlatNode | null = null;
   isEditing = false;
   isLoading = true;
   personName: string = '';
   isCreatingNew = false;
   isNewlyCreated = false;
 private clickTimeout: any = null;
 private readonly DOUBLE_CLICK_DELAY = 250;
 private clickCount = 0;
 personId!: string;

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
    //  private dummyService: BereitschaftKorrigierenService,
     private formValidationService: FormValidationService,
     private timeUtilityService: TimeUtilityService,
     private treeNodeService: TreeNodeService,
     private timeOverlapService: TimeOverlapService,
     private treeExpansionService: TreeExpansionService,
     private dateParserService: DateParserService
   ) {
     this.bereitschaftForm = this.createBereitschaftForm();
     this.alarmForm = this.createAlarmForm();
     this.monthForm = this.createMonthForm();
     this.dayForm = this.createDayForm();
   }

   ngOnInit() {
     this.route.paramMap.subscribe(params => {
       const person2Id = params.get('id');
       if ( person2Id) {
         this.loadData( person2Id);
         this.personId =  person2Id;
        this.loadAbschlussInfo(person2Id);

       }
     });
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
       startStunde: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
       startMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
       endeDatum: [null, Validators.required],
       endeStunde: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
       endeMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
       anmerkung: ['']
     });
   }

   private createMonthForm(): FormGroup {
     return this.fb.group({
       abgeschlossen: [false],
       gebuchtTotal: [''],
       monthName: ['']
     });
   }

   private createDayForm(): FormGroup {
     return this.fb.group({
       abgeschlossen: [false],
       gestempelt: [''],
       gebucht: [''],
       stempelzeiten: [''],
       dayName: ['']
     });
   }

   loadData(personId: string) {
     this.isLoading = true;
     this.dummyService.getPerson(personId, 'FullPvTlName', true, false).subscribe({
       next: (person) => {
         this.personName = `${person.vorname} ${person.nachname}`;
         this.dummyService.getPersonStempelzeitenNoAbwesenheit(personId, '2025-01-01', '2025-12-31').subscribe({
           next: (stempelzeiten) => {
             const filtered = stempelzeiten.filter((s: any) => s.zeitTyp === 'BEREITSCHAFT');
             const treeData = this.transformToTreeStructure(filtered);
             this.dataSource.data = treeData;
             this.isLoading = false;
                   this.expandCurrentAndLastMonth();

           },
           error: () => this.isLoading = false
         });
       },
       error: () => this.isLoading = false
     });
   }

   private expandCurrentAndLastMonth(): void {
  setTimeout(() => {
    const currentDate = new Date();
    const currentMonthYear = this.timeUtilityService.getMonthYearString(currentDate);

    const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthYear = this.timeUtilityService.getMonthYearString(lastMonthDate);

    const flatNodes = this.treeControl.dataNodes;

    const currentMonthNode = flatNodes.find(node =>
      node.level === 0 && node.name === currentMonthYear
    );
    if (currentMonthNode && !this.treeControl.isExpanded(currentMonthNode)) {
      this.treeControl.expand(currentMonthNode);
    }

    const lastMonthNode = flatNodes.find(node =>
      node.level === 0 && node.name === lastMonthYear
    );
    if (lastMonthNode && !this.treeControl.isExpanded(lastMonthNode)) {
      this.treeControl.expand(lastMonthNode);
    }
  }, 150);
}
transformToTreeStructure(stempelzeiten: any[]): TaetigkeitNode[] {
  const groupedByMonth: { [key: string]: any[] } = {};
  stempelzeiten.forEach(entry => {
    const loginDate = new Date(entry.login);
    const monthYear = this.timeUtilityService.getMonthYearString(loginDate);
    if (!groupedByMonth[monthYear]) groupedByMonth[monthYear] = [];
    groupedByMonth[monthYear].push(entry);
  });

  const treeData: TaetigkeitNode[] = [];

  // Sort months oldest to newest
  Object.keys(groupedByMonth).sort((a, b) => {
    const dateA = this.timeUtilityService.parseMonthYearString(a);
    const dateB = this.timeUtilityService.parseMonthYearString(b);
    return dateA.getTime() - dateB.getTime(); // ✅ Oldest first
  }).forEach(monthYear => {
    const monthEntries = groupedByMonth[monthYear];
    const totalGebucht = this.timeUtilityService.calculateTotalTime(
      monthEntries.map(e => ({ login: e.login, logoff: e.logoff }))
    );

    const monthNode: any = {
      name: monthYear,
      monthName: monthYear,
      gebuchtTotal: totalGebucht,
      hasNotification: false,
      children: []
    };

    // ✅ NEW: Get year and month to generate ALL days
    const firstEntry = monthEntries[0];
    const sampleDate = new Date(firstEntry.login);
    const year = sampleDate.getFullYear();
    const month = sampleDate.getMonth();

    // ✅ NEW: Generate all days in this month
    const allDaysInMonth = this.generateAllDaysInMonth(year, month);

    // Group stempelzeiten by day
    const groupedByDay: { [key: string]: any[] } = {};
    monthEntries.forEach(entry => {
      const loginDate = new Date(entry.login);
      const dayKey = this.timeUtilityService.formatDayName(loginDate);
      if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
      groupedByDay[dayKey].push(entry);
    });

    // ✅ NEW: Process ALL days (not just days with entries)
    allDaysInMonth.forEach(date => {
      const dayKey = this.timeUtilityService.formatDayName(date);
      const dayEntries = groupedByDay[dayKey] || []; // Empty array if no entries

      const dayTotalTime = dayEntries.length > 0
        ? this.timeUtilityService.calculateTotalTime(
            dayEntries.map(e => ({ login: e.login, logoff: e.logoff }))
          )
        : '00:00'; // No time if no entries

      const stempelzeitenList = dayEntries.length > 0
        ? this.treeNodeService.createStempelzeitenList(dayEntries)
        : [];

   const dayNode: any = {
  name: dayKey,
  dayName: dayKey,
  gestempelt: dayTotalTime,
  gebucht: dayTotalTime,
  hasEntries: dayEntries.length > 0,
  stempelzeitenList,
  children: []
};

      // Add child activities if there are entries
      dayEntries.forEach((entry: any) => {
        const loginTime = new Date(entry.login);
        const logoffTime = new Date(entry.logoff);
        const gestempelt = this.calculateGestempelt(loginTime, logoffTime);
        const timeRange = `${this.timeUtilityService.formatTime(loginTime)} - ${this.timeUtilityService.formatTime(logoffTime)}`;

        const activityNode: any = {
          name: `${timeRange} Bereitschaft`,
          gebuchtTime: gestempelt,
          timeRange: timeRange,
          stempelzeitData: entry,
          formData: {
            startDatum: loginTime,
            startStunde: loginTime.getHours(),
            startMinuten: loginTime.getMinutes(),
            endeDatum: logoffTime,
            endeStunde: logoffTime.getHours(),
            endeMinuten: logoffTime.getMinutes(),
            anmerkung: entry.anmerkung || ''
          }
        };
        dayNode.children.push(activityNode);
      });

      monthNode.children.push(dayNode);
    });

    treeData.push(monthNode);
  });

  return treeData;
}
private generateAllDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}
   calculateGestempelt(login: Date, logoff: Date): string {
     const diffMs = logoff.getTime() - login.getTime();
     const hours = Math.floor(diffMs / (1000 * 60 * 60));
     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
   console.log('Single click on:', node.name);


   if (this.showRightPanelAlarmActions && node !== this.alarmNode) {
     this.resetAlarmState();
   }

   this.isNewlyCreated = false;
   this.isCreatingNew = false;
   this.selectedNode = node;

   if (node.level === 2 && node.formData) {
     this.populateForm(node.formData);
   } else if (node.level === 0) {
     this.populateMonthForm();
   } else if (node.level === 1) {
     this.populateDayForm();
   }

   this.disableAllFormControls();
 }

 private handleDoubleClick(node: FlatNode) {
   console.log('Double click on:', node.name);


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

   populateMonthForm(): void {
     if (this.selectedNode?.level === 0) {
       this.monthForm.patchValue({
         abgeschlossen: this.selectedNode.hasNotification || false,
         gebuchtTotal: this.selectedNode.gebuchtTotal || '',
         monthName: this.selectedNode.monthName || ''
       });
       this.monthForm.disable();
     }
   }

   populateDayForm(): void {
     if (this.selectedNode?.level === 1) {
       this.dayForm.patchValue({
         abgeschlossen: this.selectedNode.hasNotification || false,
         gestempelt: this.selectedNode.gestempelt || '',
         gebucht: this.selectedNode.gebucht || '',
         stempelzeiten: this.selectedNode.stempelzeitenList?.[0] || '',
         dayName: this.selectedNode.dayName || ''
       });
       this.dayForm.disable();
     }
   }

   onAlarmClick(node: FlatNode, event: Event) {
     event.stopPropagation();
     this.alarmNode = node;
     this.isCreatingNewThirdLevel = true;
     this.showRightPanelAlarmActions = true;
     this.createNewThirdLevelForm(node);
   }

   createNewThirdLevelForm(parentNode: FlatNode) {
     this.alarmForm.reset();
     const parentDate = this.dateParserService.getDateFromFormattedDay(parentNode.dayName || '');
    //  const formattedDate = this.dateParserService.formatToGermanDate(parentDate);
     this.alarmForm.patchValue({
       startDatum: parentDate,
       startStunde: 0,
       startMinuten: 0,
       endeDatum: parentDate,
       endeStunde: 0,
       endeMinuten: 0,
       anmerkung: ''
     });
   }

 approveNewThirdLevel() {
   if (!this.alarmForm || !this.alarmNode) return;

   this.formValidationService.validateAllFields(this.alarmForm);
   if (!this.alarmForm.valid) {
     this.showAlarmFormValidationErrors();
     return;
   }

   const formValue = this.alarmForm.value;


   const validationResult = this.timeOverlapService.validateBereitschaftEntry(
     formValue,
     this.dataSource.data,
     undefined
   );

   if (!validationResult.isValid) {
     this.snackBar.open(validationResult.errorMessage!, 'Schließen', {
       duration: 5000,
       verticalPosition: 'top'
     });
     return;
   }

   const startDate = this.timeOverlapService.parseGermanDate(formValue.startDatum)!;
   const endDate = this.timeOverlapService.parseGermanDate(formValue.endeDatum)!;

   const loginDate = new Date(startDate);
   loginDate.setHours(formValue.startStunde, formValue.startMinuten, 0, 0);
   const logoffDate = new Date(endDate);
   logoffDate.setHours(formValue.endeStunde, formValue.endeMinuten, 0, 0);

   const gebuchtTime = this.calculateGestempelt(loginDate, logoffDate);
   const timeRange = `${this.timeUtilityService.formatTime(loginDate)} - ${this.timeUtilityService.formatTime(logoffDate)}`;

   const newStempelzeitData = {
     id: `new-${Date.now()}`,
     login: loginDate.toISOString(),
     logoff: logoffDate.toISOString(),
     zeitTyp: 'BEREITSCHAFT',
     version: 1,
     deleted: false,
     anmerkung: formValue.anmerkung || ''
   };

   const newActivityData = { ...formValue };
   const monthYear = this.timeUtilityService.getMonthYearString(startDate);
   const monthNode = this.findOrCreateMonthNode(monthYear);
   const dayKey = this.timeUtilityService.formatDayName(startDate);
   const dayNode = this.findOrCreateDayNode(monthNode, dayKey, startDate);

   this.addActivityToDay(dayNode, newActivityData, timeRange, gebuchtTime, newStempelzeitData);
   this.recalculateDayTotals(dayNode);

   this.dataSource.data = [...this.dataSource.data];
   this.expandParentNodesForNewEntry(monthYear, dayKey);

   setTimeout(() => {
     const newNode = this.treeControl.dataNodes.find(node =>
       node.level === 2 &&
       node.formData &&
       node.formData.startDatum === formValue.startDatum &&
       node.timeRange === timeRange
     );

     if (newNode) {
       this.finalizeNewEntry(newNode);
     }
   }, 150);

   this.snackBar.open('Neue Bereitschaft erfolgreich erstellt!', 'Schließen', {
     duration: 3000,
     verticalPosition: 'top'
   });
   this.resetAlarmState();
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

   private findOrCreateMonthNode(monthYear: string): TaetigkeitNode {
     return this.treeNodeService.findOrCreateMonthNode(
       this.dataSource.data, monthYear,
       (my) => this.timeUtilityService.parseMonthYearString(my)
     );
   }

   private findOrCreateDayNode(monthNode: TaetigkeitNode, dayKey: string, date: Date): TaetigkeitNode {
     return this.treeNodeService.findOrCreateDayNode(
       monthNode, dayKey, date,
       (dayStr) => this.dateParserService.getDateFromFormattedDay(dayStr)
     );
   }

   private addActivityToDay(dayNode: TaetigkeitNode, formData: any, timeRange: string, gebuchtTime: string, stempelzeitData?: any): void {
     if (!dayNode.children) dayNode.children = [];
     const newChild: TaetigkeitNode = {
       name: `Bereitschaft ${timeRange}`,
       gebuchtTime: gebuchtTime,
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

   }

   private expandParentNodesForNewEntry(monthYear: string, dayKey: string): void {
     this.treeExpansionService.expandParentNodesForNewEntry(this.treeControl, monthYear, dayKey);
   }

   addTimeEntryFromHeader() {
     if (this.isCreatingNew || this.isNewlyCreated) this.cancelFormChanges();
     const currentTime = new Date();
     const currentDateString = currentTime.toLocaleDateString('de-DE');
     this.isCreatingNew = true;
     this.isNewlyCreated = true;
     this.showRightPanelAlarmActions = false;
     this.isEditing = true;

     this.bereitschaftForm.reset();
     this.bereitschaftForm.enable();
     this.bereitschaftForm.patchValue({
       startDatum: new Date(),
       startStunde: 0,
       startMinuten: 0,
       endeDatum: new Date(),
       endeStunde: 0,
       endeMinuten: 0,
       anmerkung: ''
     });

     this.selectedNode = {
       level: 2,
       expandable: false,
       name: 'Neue Bereitschaft',
       hasNotification: false,
       formData: { startDatum: currentDateString, startStunde: 0, startMinuten: 0, endeDatum: currentDateString, endeStunde: 0, endeMinuten: 0, anmerkung: '' }
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
       } else if (this.selectedNode.level === 0) {
         this.populateMonthForm();
       } else if (this.selectedNode.level === 1) {
         this.populateDayForm();
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
     this.saveNewEntry(formValue);
   } else {
     this.updateExistingEntry(formValue);
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
   const startDate = this.dateParserService.parseGermanDate(formValue.startDatum);
   const endDate = this.dateParserService.parseGermanDate(formValue.endeDatum);
   if (!startDate || !endDate) return;

   const loginDate = new Date(startDate);
   loginDate.setHours(formValue.startStunde, formValue.startMinuten, 0, 0);

   const logoffDate = new Date(endDate);
   logoffDate.setHours(formValue.endeStunde, formValue.endeMinuten, 0, 0);

   const gebuchtTime = this.calculateGestempelt(loginDate, logoffDate);
   const timeRange = `${this.timeUtilityService.formatTime(loginDate)} - ${this.timeUtilityService.formatTime(logoffDate)}`;

 const dto: Partial<ApiStempelzeit> = {
 //   id: '',
 //   version: 0,
 //   deleted: false,
 //   login: loginDate.toISOString(),
 //   logoff: logoffDate.toISOString(),
 //   zeitTyp: ApiZeitTyp.BEREITSCHAFT,
 //   anmerkung: formValue.anmerkung || ''
 // };
  login: loginDate.toISOString(),
   logoff: logoffDate.toISOString(),
   zeitTyp: ApiZeitTyp.BEREITSCHAFT,
   anmerkung: formValue.anmerkung || ''
 };

   this.dummyService
     .createBereitschaft(this.personId, dto)
     .subscribe({
       next: () => {
         const monthYear = this.timeUtilityService.getMonthYearString(startDate);
         const monthNode = this.findOrCreateMonthNode(monthYear);
         const dayKey = this.timeUtilityService.formatDayName(startDate);
         const dayNode = this.findOrCreateDayNode(monthNode, dayKey, startDate);

         this.addActivityToDay(
           dayNode,
           formValue,
           timeRange,
           gebuchtTime,
           dto
         );

         this.dataSource.data = [...this.dataSource.data];
         this.expandParentNodesForNewEntry(monthYear, dayKey);

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


   private updateExistingEntry(formValue: any): void {
     if (!this.selectedNode?.formData) return;
     Object.assign(this.selectedNode.formData, formValue);
     if (this.selectedNode.stempelzeitData) {
       const startDate = this.dateParserService.parseGermanDate(formValue.startDatum);
       const endDate = this.dateParserService.parseGermanDate(formValue.endeDatum);
       if (startDate && endDate) {
         const loginDate = new Date(startDate);
         loginDate.setHours(formValue.startStunde, formValue.startMinuten);
         const logoffDate = new Date(endDate);
         logoffDate.setHours(formValue.endeStunde, formValue.endeMinuten);
         this.selectedNode.stempelzeitData.login = loginDate.toISOString();
         this.selectedNode.stempelzeitData.logoff = logoffDate.toISOString();
       }
     }
   }

   private showValidationErrors(): void {
     const errors = this.formValidationService.getValidationErrors(this.bereitschaftForm, this.fieldDisplayMap);
     if (errors.length > 0) {
       const errorMessage = this.formValidationService.formatValidationErrors(errors);
       this.snackBar.open(errorMessage, 'Schließen', { duration: 5000, verticalPosition: 'top' });
     }
   }

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
     this.monthForm.disable();
     this.dayForm.disable();
   }

   enableAllFormControls(): void {
     this.bereitschaftForm.enable();
   }

   hasChild = (_: number, node: FlatNode) => node.expandable;

   goBackToList() {
     this.router.navigate(['/standby']);
   }

   onCheckboxChange(event: any): void {
     if (this.selectedNode && this.isEditing) {
       this.selectedNode.hasNotification = event.checked;
     }
   }
 adjustTime(type: 'start' | 'end', unit: 'hour' | 'minute', amount: number) {
   const isAlarmMode = this.showRightPanelAlarmActions;
   const isEditMode = this.isEditing || this.isCreatingNew || this.isNewlyCreated;

   if (!isAlarmMode && !isEditMode) {
     return;
   }

   const form = isAlarmMode ? this.alarmForm : this.bereitschaftForm;
   const controlName =
       type === 'start' && unit === 'hour' ? 'startStunde' :
       type === 'start' && unit === 'minute' ? 'startMinuten' :
       type === 'end' && unit === 'hour' ? 'endeStunde' : 'endeMinuten';

   const control = form.get(controlName);
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
         const minuteControl = form.get(minuteControlName);
         if (minuteControl && minuteControl.value !== 0) {
           minuteControl.setValue(0);
         }
       }
     } else {
       // Check if hour is 24
       const hourControlName = type === 'start' ? 'startStunde' : 'endeStunde';
       const hourControl = form.get(hourControlName);
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
 // private validateHour24Rule(formValue: any, formType: 'start' | 'end'): boolean {
 //   const hour = formType === 'start' ? formValue.startStunde : formValue.endeStunde;
 //   const minute = formType === 'start' ? formValue.startMinuten : formValue.endeMinuten;

 //   if (hour === 24 && minute !== 0) {
 //     this.snackBar.open(
 //       `${formType === 'start' ? 'Start' : 'Ende'}: Bei 24 Stunden müssen die Minuten 0 sein`,
 //       'Schließen',
 //       { duration: 5000, verticalPosition: 'top' }
 //     );
 //     return false;
 //   }
 //   return true;
 // }
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
 getFullDayOfWeekFromNode(node: FlatNode | null): string {
   if (!node) return '';

   const sourceString = node.dayName || node.name || '';

   if (!sourceString) return '';

   // Pattern matches: "So." or "Mo." etc, then spaces, then day number, then ". ", then month name
   const dateMatch = sourceString.match(/(\w{2})\.\s+(\d{1,2})\.\s+(\w+)/);

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

 getDateDisplayFromNode(node: FlatNode | null): string {
   if (!node) return '';

   const sourceString = node.dayName || node.name || '';

   if (!sourceString) return '';

   // The format is: "So.  09. November"
   const dateMatch = sourceString.match(/(\w{2})\.\s+(\d{1,2})\.\s+(\w+)/);

   if (dateMatch) {
     const [, , day, monthName] = dateMatch;
     return `${day.padStart(2, '0')}. ${monthName}`;
   }
   return '';
 }
 loadAbschlussInfo(personId: string) {
   this.dummyService.getPersonAbschlussInfo(personId).subscribe({
     next: (abschlussInfo) => {
       console.log('AbschlussInfo loaded:', abschlussInfo);
       this.monthForm.patchValue({
         abgeschlossen: abschlussInfo.letzterMonatsabschluss ? true : false,
         monthName: 'Januar 2026'
       });
       this.monthForm.disable();
     },
     error: (err) => {
       console.error('Failed to load AbschlussInfo', err);
     }
   });
 }
private recalculateDayTotals(dayNode: TaetigkeitNode): void {
  if (!dayNode.children || dayNode.children.length === 0) {
    dayNode.gestempelt = '00:00';
    dayNode.gebucht = '00:00';
    dayNode.hasEntries = false;
    return;
  }

  const ranges = dayNode.children
    .filter(c => c.stempelzeitData)
    .map(c => ({
      login: c.stempelzeitData.login,
      logoff: c.stempelzeitData.logoff
    }));

  const total = this.timeUtilityService.calculateTotalTime(ranges);

  dayNode.gestempelt = total;
  dayNode.gebucht = total;
  dayNode.hasEntries = true;
}

 }

