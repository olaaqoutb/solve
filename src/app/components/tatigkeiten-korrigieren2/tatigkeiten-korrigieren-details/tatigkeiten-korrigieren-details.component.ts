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
// import{TatigkeitenKorrigierenService} from '../../../services/tatigkeiten-korrigieren.service';
import { MatCheckbox } from "@angular/material/checkbox";
import { forkJoin, from } from 'rxjs';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FlatNode } from '../../../models/Flat-node';
import { TaetigkeitNode } from '../../../models/TaetigkeitNode';

// Importutility services
import { FormValidationService } from '../../../services/utils/form-validation.service';
import { TimeUtilityService } from '../../../services/utils/time-utility.service';
import { TreeNodeService } from '../../../services/utils/tree-node.service';
import { TimeOverlapService } from '../../../services/utils/time-overlap.service';
import { DropdownExtractorService } from '../../../services/utils/dropdown-extractor.service';
import { TreeExpansionService } from '../../../services/utils/tree-expansion.service';
import { DateParserService } from '../../../services/utils/date-parser.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../../services/custom-date-adapter.service'; // adjust path as needed

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
  selector: 'app-tatigkeiten-korrigieren-details',
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
  ]
  ,
  templateUrl: './tatigkeiten-korrigieren-details.component.html',
  styleUrl: './tatigkeiten-korrigieren-details.component.scss'
})
export class TatigkeitenKorrigierenDetailsComponent {
  buchungsartOptions = ['ARBEITSZEIT', 'REMOTEZEIT'];
   produktOptions: any[] = [];
   produktpositionOptions: any[] = [];
   buchungspunktOptions: any[] = [];
   taetigkeitOptions: any[] = [
     { taetigkeitTyp: 'PROGRAMMIERUNG' },
     { taetigkeitTyp: 'DEPLOYMENT' },
     { taetigkeitTyp: 'BERICHT' },
     { taetigkeitTyp: 'BESPRECHUNG' },
     { taetigkeitTyp: 'DATENBANKDESIGN' },
     { taetigkeitTyp: 'PROJEKTMANAGEMENT' }
   ];
   dropdownOptions: string[] = ["2025", "2024", "2023", "2022", "2021", "2020"];
   selectedOption: string = this.dropdownOptions[0];

   treeControl = new FlatTreeControl<FlatNode>(
     node => node.level,
     node => node.expandable
   );

   isCreatingNewThirdLevel = false;
   alarmNode: FlatNode | null = null;
   showRightPanelAlarmActions = false;

   private transformer = (node: TaetigkeitNode, level: number): FlatNode => {
     const flatNode: FlatNode = {
       expandable: !!node.children && node.children.length > 0,
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
       timeRange: node.timeRange,
       hasAlarm: node.hasAlarm || false,
       alarmData: node.alarmData || null
     };

     return flatNode;
   };

   createNewThirdLevelForm(parentNode: FlatNode) {
     this.alarmForm.reset();

     const parentDate = this.dateParserService.getDateFromFormattedDay(parentNode.dayName || '');
     const formattedDate = this.dateParserService.formatToGermanDate(parentDate);
     this.alarmForm.patchValue({
      datum: parentDate,
       buchungsart: 'ARBEITSZEIT',
       produkt: '',
       produktposition: '',
       buchungspunkt: '',
       taetigkeit: '',
       durationStunde: 0,
       durationMinuten: 0,
       anmerkung: '',
       jiraTicket: ''
     });

     console.log('Alarm form initialized:', this.alarmForm.value);
   }
 approveNewThirdLevel() {
   if (!this.alarmForm || !this.alarmNode) return;

   this.formValidationService.validateAllFields(this.alarmForm);

   if (!this.alarmForm.valid) {
     this.showAlarmFormValidationErrors();
     return;
   }

   const formValue = this.alarmForm.value;

const selectedDate: Date = this.alarmForm.value.datum;
const formattedDate =
  this.dateParserService.formatToGermanDate(selectedDate);

   const startHour = 0;
   const startMinute = 0;

   const durationHours = formValue.durationStunde || 0;
   const durationMinutes = formValue.durationMinuten || 0;

   const totalMinutes = startMinute + durationMinutes;
   const totalHours = startHour + durationHours + Math.floor(totalMinutes / 60);
   const finalMinutes = totalMinutes % 60;

   const endHour = Math.min(totalHours, 24);
   const endMinute = endHour === 24 ? 0 : finalMinutes;

   if (durationHours === 0 && durationMinutes === 0) {
     this.snackBar.open(
       'Bitte geben Sie eine gültige Dauer ein',
       'Schließen',
       { duration: 5000, verticalPosition: 'top' }
     );
     return;
   }

   const validationResult = this.validateTimeEntryOverlap({
     datum: formattedDate,
     anmeldezeitStunde: startHour,
     anmeldezeitMinuten: startMinute,
     abmeldezeitStunde: endHour,
     abmeldezeitMinuten: endMinute
   });

   if (!validationResult.isValid) {
     this.snackBar.open(
       validationResult.errorMessage || 'Ungültige Zeitangaben',
       'Schließen',
       { duration: 5000, verticalPosition: 'top' }
     );
     return;
   }

   const dateParts = formattedDate.split('.');
   const day = parseInt(dateParts[0], 10);
   const month = parseInt(dateParts[1], 10) - 1;
   const year = parseInt(dateParts[2], 10);

   const loginDate = new Date(year, month, day, startHour, startMinute);
   const logoffDate = new Date(year, month, day, endHour, endMinute);

   const gebuchtTime = this.calculateGestempelt(loginDate, logoffDate);
   const timeRange = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')} - ${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

   const newStempelzeitData = {
     id: `new-${Date.now()}`,
     login: loginDate.toISOString(),
     logoff: logoffDate.toISOString(),
     zeitTyp: formValue.buchungsart,
     version: 1,
     deleted: false
   };

   const newActivityData = {
     datum: formattedDate,
     buchungsart: formValue.buchungsart,
     produkt: formValue.produkt,
     produktposition: formValue.produktposition,
     buchungspunkt: formValue.buchungspunkt,
     taetigkeit: formValue.taetigkeit,
     anmeldezeit: {
       stunde: startHour,
       minuten: startMinute
     },
     abmeldezeit: {
       stunde: endHour,
       minuten: endMinute
     },
     gestempelt: gebuchtTime,
     gebucht: gebuchtTime,
     anmerkung: formValue.anmerkung || '',
     jiraTicket: formValue.jiraTicket || ''
   };

   const monthYear = this.timeUtilityService.getMonthYearString(selectedDate);
   const monthNode = this.findOrCreateMonthNode(monthYear);
   const dayKey = this.timeUtilityService.formatDayName(selectedDate);
   const dayNode = this.findOrCreateDayNode(monthNode, dayKey, selectedDate);

   this.addActivityToDay(dayNode, newActivityData, timeRange, newStempelzeitData);

   this.dataSource.data = [...this.dataSource.data];

   this.expandParentNodesForNewEntry(monthYear, dayKey);

   this.isNewlyCreated = false;
   this.isCreatingNew = false;
   this.isEditing = false;

   console.log('Flags reset after alarm save:', { isNewlyCreated: this.isNewlyCreated, isCreatingNew: this.isCreatingNew, isEditing: this.isEditing });

   setTimeout(() => {
     const flatNodes = this.treeControl.dataNodes;
     const newNode = flatNodes.find(node =>
       node.level === 2 &&
       node.formData &&
       node.formData.datum === formattedDate &&
       node.formData.produkt === formValue.produkt &&
       node.formData.produktposition === formValue.produktposition &&
       node.timeRange === timeRange
     );

     if (newNode) {
       this.selectedNode = newNode;
       this.populateForm(newNode.formData);
       this.disableAllFormControls();
       this.cdr.detectChanges();
       console.log('Alarm node selected and change detection triggered');
     }
   }, 150);

   this.snackBar.open('Neue Tätigkeit erfolgreich erstellt!', 'Schließen', {
     duration: 3000,
     verticalPosition: 'top'
   });

   this.resetAlarmState();
 }

  private findOrCreateMonthNode(monthYear: string): TaetigkeitNode {
     return this.treeNodeService.findOrCreateMonthNode(
       this.dataSource.data,
       monthYear,
       (my) => this.timeUtilityService.parseMonthYearString(my)
     );
   }

   private findOrCreateDayNode(monthNode: TaetigkeitNode, dayKey: string, date: Date): TaetigkeitNode {
     return this.treeNodeService.findOrCreateDayNode(
       monthNode,
       dayKey,
       date,
       (dayStr) => this.getDateFromFormattedDay(dayStr)
     );
   }

  private addActivityToDay(dayNode: TaetigkeitNode, formData: any, timeRange: string, stempelzeitData?: any): void {
     this.treeNodeService.addActivityToDay(dayNode, formData, timeRange, stempelzeitData);
   }

  private expandParentNodesForNewEntry(monthYear: string, dayKey: string): void {
     this.treeExpansionService.expandParentNodesForNewEntry(
       this.treeControl,
       monthYear,
       dayKey
     );
   }

   cancelNewThirdLevel() {
     this.resetAlarmState();
     this.alarmForm.reset();
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

   private updateParentTimes(dayNode: TaetigkeitNode) {
     this.treeNodeService.updateParentTimes(dayNode);
   }

   treeFlattener = new MatTreeFlattener(
     this.transformer,
     node => node.level,
     node => node.expandable,
     node => node.children
   );

   dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

   taetigkeitForm: FormGroup;
   selectedNode: FlatNode | null = null;
   isEditing = false;
   isLoading = true;
  personName: string = '';
   isCreatingNew = false;
   isNewlyCreated = false;
   monthForm: FormGroup;
   dayForm: FormGroup;

   private fieldDisplayMap: { [key: string]: string } = {
     'datum': 'Datum',
     'buchungsart': 'Buchungsart',
     'anmeldezeitStunde': 'Anmeldezeit Stunde',
     'anmeldezeitMinuten': 'Anmeldezeit Minuten',
     'abmeldezeitStunde': 'Abmeldezeit Stunde',
     'abmeldezeitMinuten': 'Abmeldezeit Minuten',
     'anmerkung': 'Anmerkung'
   };
   alarmForm: FormGroup;

   constructor(
     private fb: FormBuilder,
     private snackBar: MatSnackBar,
     private route: ActivatedRoute,
     private router: Router,
     private cdr: ChangeDetectorRef,
     private dialog: MatDialog,
     private dummyService:DummyService,
    //  private tatigkeitenKorrigierenService:TatigkeitenKorrigierenService,
     private formValidationService: FormValidationService,
     private timeUtilityService: TimeUtilityService,
         // Add new services
     private treeNodeService: TreeNodeService,
     private timeOverlapService: TimeOverlapService,
     private dropdownExtractorService: DropdownExtractorService,
     private treeExpansionService: TreeExpansionService,
     private dateParserService: DateParserService


   ) {
     this.taetigkeitForm = this.createForm();
     this.monthForm = this.createMonthForm();
     this.dayForm = this.createDayForm();
     this.alarmForm = this.createForm();
     this.alarmForm = this.createAlarmForm();

   }

   ngOnInit() {
     this.route.paramMap.subscribe(params => {
       const personId = params.get('id');
       if (personId) {
         this.loadData(personId);
         this.getPersonName(personId);
       }
     });
   }
   // Create alarm form with duration fields
   private createAlarmForm(): FormGroup {
     return this.fb.group({
       datum: [null, Validators.required],
       buchungsart: ['ARBEITSZEIT', Validators.required],
       produkt: [''],
       produktposition: [''],
       buchungspunkt: [''],
       taetigkeit: [''],
       durationStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
       durationMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
       anmerkung: [''],
       jiraTicket: ['']
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

   createForm(): FormGroup {
     return this.fb.group({
       datum: [null, Validators.required],
       buchungsart: ['ARBEITSZEIT', Validators.required],
       produkt: [''],
       produktposition: [''],
       buchungspunkt: [''],
       taetigkeit: [''],
       anmeldezeitStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
       anmeldezeitMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
       abmeldezeitStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
       abmeldezeitMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
       gestempelt: [{ value: '', disabled: true }],
       gebucht: [{ value: '', disabled: true }],
       anmerkung: [''],
       jiraTicket: ['']
     });
   }

   loadData(personId: string) {
     this.isLoading = true;

     this.dummyService.getPerson(personId, 'FullPvTlName', true, false).subscribe({
       next: (person) => {
         console.log('Person loaded:', person);
         this.personName = `${person.vorname} ${person.nachname}`;

         forkJoin({
           products: this.dummyService.getPersonProdukte(
             personId,
             'gebucht',
             '2025-01-01',
             '2025-12-31'
           ),
           stempelzeiten: this.dummyService.getPersonStempelzeiten(
             personId,
             '2025-01-01',
             '2025-12-31'
           )
         }).subscribe({
           next: (results) => {
             console.log('Products loaded:', results.products.length);
             console.log('Stempelzeiten loaded:', results.stempelzeiten.length);

             this.produktOptions = results.products;
             this.extractDropdownOptions(results.products);

             const treeData = this.transformToTreeStructure(
               results.products,
               results.stempelzeiten
             );
             this.dataSource.data = treeData;

             console.log('Tree data created:', treeData.length, 'months');
             this.isLoading = false;
           },
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
      console.log('Abschluss info from dummy:', info);
      this.isLoading = false;
    },
    error: () => this.isLoading = false
  });
   }

  extractDropdownOptions(products: any[]) {
     const options = this.dropdownExtractorService.extractDropdownOptions(products);
     this.produktpositionOptions = options.produktpositionOptions;
     this.buchungspunktOptions = options.buchungspunktOptions;
   }

   transformToTreeStructure(products: any[], stempelzeiten: any[]): TaetigkeitNode[] {
     const treeData: TaetigkeitNode[] = [];

     const filteredStempelzeiten = stempelzeiten.filter(s =>
       s.zeitTyp === 'ARBEITSZEIT' || s.zeitTyp === 'REMOTEZEIT'
     );

     console.log('Filtered stempelzeiten:', filteredStempelzeiten.length);

     const stempelzeitToProductMap = this.mapStempelzeitenToProducts(products);

     const groupedByMonth: { [key: string]: any[] } = {};

     filteredStempelzeiten.forEach(entry => {
       const loginDate = new Date(entry.login);
       // Using TimeUtilityService
       const monthYear = this.timeUtilityService.getMonthYearString(loginDate);

       if (!groupedByMonth[monthYear]) {
         groupedByMonth[monthYear] = [];
       }
       groupedByMonth[monthYear].push(entry);
     });

     console.log('Months found:', Object.keys(groupedByMonth).length);

     Object.keys(groupedByMonth).sort((a, b) => {
       // Using TimeUtilityService
       const dateA = this.timeUtilityService.parseMonthYearString(a);
       const dateB = this.timeUtilityService.parseMonthYearString(b);
       return dateB.getTime() - dateA.getTime();
     }).forEach(monthYear => {
       const monthEntries = groupedByMonth[monthYear];
       // Using TimeUtilityService
       const totalGebucht = this.timeUtilityService.calculateTotalTime(
         monthEntries.map(e => ({ login: e.login, logoff: e.logoff }))
       );

       // Using TimeUtilityService
       const monthDate = this.timeUtilityService.parseMonthYearString(monthYear);
       const now = new Date();
       const isAbgeschlossen = monthDate < new Date(now.getFullYear(), now.getMonth(), 1);

       const monthNode: any = {
         name: monthYear,
         monthName: monthYear,
         gebuchtTotal: totalGebucht,
         hasNotification: isAbgeschlossen,
         children: [],
       };

       const groupedByDay: { [key: string]: any[] } = {};

       monthEntries.forEach(entry => {
         const loginDate = new Date(entry.login);
         // Using TimeUtilityService
         const dayKey = this.timeUtilityService.formatDayName(loginDate);

         if (!groupedByDay[dayKey]) {
           groupedByDay[dayKey] = [];
         }
         groupedByDay[dayKey].push(entry);
       });

       Object.keys(groupedByDay).sort((a, b) => {
         const dateA = this.getDateFromFormattedDay(a);
         const dateB = this.getDateFromFormattedDay(b);
         return dateB.getTime() - dateA.getTime();
       }).forEach(dayKey => {
         const dayEntries = groupedByDay[dayKey];
         // Using TimeUtilityService
         const dayTotalTime = this.timeUtilityService.calculateTotalTime(
           dayEntries.map(e => ({ login: e.login, logoff: e.logoff }))
         );
         const stempelzeitenList = this.createStempelzeitenList(dayEntries);

         const dayNode: any = {
           name: dayKey,
           dayName: dayKey,
           gestempelt: dayTotalTime,
           gebucht: dayTotalTime,
           hasNotification: false,
           stempelzeitenList: stempelzeitenList,
           children: [],
           monthName: undefined,
           gebuchtTotal: undefined,
           productName: undefined,
           positionName: undefined,
           gebuchtTime: undefined,
           timeRange: undefined
         };

         dayEntries.forEach((entry) => {
           const loginTime = new Date(entry.login);
           const logoffTime = new Date(entry.logoff);
           const gestempelt = this.calculateGestempelt(loginTime, logoffTime);
           // Using TimeUtilityService
           const timeRange = `${this.timeUtilityService.formatTime(loginTime)} - ${this.timeUtilityService.formatTime(logoffTime)}`;

           const productInfo = stempelzeitToProductMap.get(entry.id);

           let produktName = 'Keine Produktzuordnung';
           let positionName = '';
           let buchungspunkt = '';
           let taetigkeitTyp = '';

           if (productInfo) {
             produktName = productInfo.produktKurzName;
             positionName = productInfo.positionName;
             buchungspunkt = productInfo.buchungspunkt;
             taetigkeitTyp = productInfo.taetigkeit;
           }

           const activityNode: any = {
             name: `${produktName} ${positionName}`,
             productName: produktName,
             positionName: positionName,
             gebuchtTime: gestempelt,
             timeRange: timeRange,
             stempelzeitData: entry,
             formData: {
               datum: loginTime.toLocaleDateString('de-DE'),
               buchungsart: entry.zeitTyp,
               produkt: produktName,
               produktposition: positionName,
               buchungspunkt: buchungspunkt,
               taetigkeit: taetigkeitTyp,
               anmeldezeit: {
                 stunde: loginTime.getHours(),
                 minuten: loginTime.getMinutes()
               },
               abmeldezeit: {
                 stunde: logoffTime.getHours(),
                 minuten: logoffTime.getMinutes()
               },
               gestempelt: gestempelt,
               gebucht: gestempelt,
               anmerkung: entry.anmerkung || '',
               jiraTicket: entry.jiraTicket || ''
             },
             monthName: undefined,
             gebuchtTotal: undefined,
             dayName: undefined,
             gestempelt: undefined,
             gebucht: undefined
           };

           dayNode.children!.push(activityNode);
         });

         monthNode.children!.push(dayNode);
       });

       treeData.push(monthNode);
     });

     console.log('=== TRANSFORM END ===');
     return treeData;
   }

  mapStempelzeitenToProducts(products: any[]): Map<string, any> {
     return this.treeNodeService.mapStempelzeitenToProducts(products);
   }

 createStempelzeitenList(entries: any[]): string[] {
   return this.treeNodeService.createStempelzeitenList(entries);
 }
   calculateGestempelt(login: Date, logoff: Date): string {
     const diffMs = logoff.getTime() - login.getTime();
     const hours = Math.floor(diffMs / (1000 * 60 * 60));
     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
   }

  getDateFromFormattedDay(dayString: string): Date {
     return this.dateParserService.getDateFromFormattedDay(dayString);
   }

   getPersonName(person2Id: string) {
     // Already set in loadData
   }

   goBackToList() {
     this.router.navigate(['/edit-activities']);
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
    this.populateForm(node.formData);
  } else if (node.level === 0) {
    this.populateMonthForm();
  } else if (node.level === 1) {
    this.populateDayForm();
  }

  this.disableAllFormControls();
}

   populateForm(formData: any) {
     if (!this.showRightPanelAlarmActions) {
       this.taetigkeitForm.patchValue({
         datum: formData.datum,
         buchungsart: formData.buchungsart,
         produkt: formData.produkt,
         produktposition: formData.produktposition,
         buchungspunkt: formData.buchungspunkt,
         taetigkeit: formData.taetigkeit,
         anmeldezeitStunde: formData.anmeldezeit.stunde,
         anmeldezeitMinuten: formData.anmeldezeit.minuten,
         abmeldezeitStunde: formData.abmeldezeit.stunde,
         abmeldezeitMinuten: formData.abmeldezeit.minuten,
         gestempelt: formData.gestempelt,
         gebucht: formData.gebucht,
         anmerkung: formData.anmerkung,
         jiraTicket: formData.jiraTicket || ''
       });
     }
   }

 saveForm() {
   this.formValidationService.validateAllFields(this.taetigkeitForm);

   if (this.taetigkeitForm.valid) {
     const formValue = this.taetigkeitForm.getRawValue();

     const validationResult = this.validateTimeEntryOverlap(formValue);
     if (!validationResult.isValid) {
       this.snackBar.open(
         validationResult.errorMessage || 'Ungültige Zeitangaben',
         'Schließen',
         { duration: 5000, verticalPosition: 'top' }
       );
       return;
     }
     if (this.isCreatingNew || this.isNewlyCreated) {
       this.saveNewEntry();
       return;
     }
     const originalDatum = this.selectedNode?.formData?.datum;
     const datumChanged = originalDatum && formValue.datum !== originalDatum;

     if (datumChanged) {
       this.relocateEntry(formValue);
     } else {
       this.updateExistingEntry(formValue);
     }

     this.snackBar.open('Änderungen gespeichert!', 'Schließen', {
       duration: 3000,
       verticalPosition: 'top'
     });

     this.isEditing = false;
     this.isNewlyCreated = false;
     this.disableAllFormControls();
   } else {
     this.showValidationErrors();
   }
 }

 private saveNewEntry(): void {
   console.log('=== START saveNewEntry ===');
   const formValue = this.taetigkeitForm.getRawValue();

   const selectedDate = this.parseGermanDate(formValue.datum);
   if (!selectedDate) {
     this.snackBar.open('Ungültiges Datumformat', 'Schließen', {
       duration: 3000,
       verticalPosition: 'top'
     });
     return;
   }

   const startTime = `${String(formValue.anmeldezeitStunde).padStart(2, '0')}:${String(formValue.anmeldezeitMinuten).padStart(2, '0')}`;
   const endTime = `${String(formValue.abmeldezeitStunde).padStart(2, '0')}:${String(formValue.abmeldezeitMinuten).padStart(2, '0')}`;
   const timeRange = `${startTime} - ${endTime}`;

   const startMinutes = formValue.anmeldezeitStunde * 60 + formValue.anmeldezeitMinuten;
   const endMinutes = formValue.abmeldezeitStunde * 60 + formValue.abmeldezeitMinuten;
   const durationMinutes = endMinutes - startMinutes;
   const gebuchtHours = Math.floor(durationMinutes / 60);
   const gebuchtMins = durationMinutes % 60;
   const gebuchtTime = `${String(gebuchtHours).padStart(2, '0')}:${String(gebuchtMins).padStart(2, '0')}`;

   const loginDate = new Date(selectedDate);
   loginDate.setHours(formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten, 0, 0);
   const logoffDate = new Date(selectedDate);
   logoffDate.setHours(formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten, 0, 0);

   const newStempelzeitData = {
     id: `new-${Date.now()}`,
     version: 1,
     deleted: false,
     login: loginDate.toISOString(),
     logoff: logoffDate.toISOString(),
     zeitTyp: formValue.buchungsart,
     poKorrektur: false,
     marker: [],
     eintragungsart: 'NORMAL'
   };

   const newActivityData = {
     datum: formValue.datum,
     buchungsart: formValue.buchungsart,
     produkt: formValue.produkt,
     produktposition: formValue.produktposition,
     buchungspunkt: formValue.buchungspunkt,
     taetigkeit: formValue.taetigkeit,
     anmeldezeit: {
       stunde: formValue.anmeldezeitStunde,
       minuten: formValue.anmeldezeitMinuten
     },
     abmeldezeit: {
       stunde: formValue.abmeldezeitStunde,
       minuten: formValue.abmeldezeitMinuten
     },
     gestempelt: gebuchtTime,
     gebucht: gebuchtTime,
     anmerkung: formValue.anmerkung || '',
     jiraTicket: formValue.jiraTicket || ''
   };

   const monthYear = this.timeUtilityService.getMonthYearString(selectedDate);
   const monthNode = this.findOrCreateMonthNode(monthYear);
   const dayKey = this.timeUtilityService.formatDayName(selectedDate);
   const dayNode = this.findOrCreateDayNode(monthNode, dayKey, selectedDate);

   this.addActivityToDay(dayNode, newActivityData, timeRange, newStempelzeitData);

   this.dataSource.data = [...this.dataSource.data];

   this.expandParentNodesForNewEntry(monthYear, dayKey);
   this.isNewlyCreated = false;
   this.isCreatingNew = false;
   this.isEditing = false;

   console.log('Flags reset after save:', { isNewlyCreated: this.isNewlyCreated, isCreatingNew: this.isCreatingNew, isEditing: this.isEditing });

   setTimeout(() => {
     const flatNodes = this.treeControl.dataNodes;
     const newNode = flatNodes.find(node =>
       node.level === 2 &&
       node.formData &&
       node.formData.datum === formValue.datum &&
       node.formData.produkt === formValue.produkt &&
       node.formData.produktposition === formValue.produktposition &&
       node.timeRange === timeRange
     );

     if (newNode) {
       this.selectedNode = newNode;
       this.populateForm(newNode.formData);
       this.disableAllFormControls();

       this.cdr.detectChanges();
       console.log('Node selected and change detection triggered');
     }
   }, 150);

   this.snackBar.open('Neue Tätigkeit erfolgreich erstellt!', 'Schließen', {
     duration: 3000,
     verticalPosition: 'top'
   });

   console.log('=== END saveNewEntry ===');
 }
   private updateExistingEntry(formValue: any): void {
     if (!this.selectedNode?.formData) return;

     this.selectedNode.formData.datum = formValue.datum;
     this.selectedNode.formData.buchungsart = formValue.buchungsart;
     this.selectedNode.formData.produkt = formValue.produkt;
     this.selectedNode.formData.produktposition = formValue.produktposition;
     this.selectedNode.formData.buchungspunkt = formValue.buchungspunkt;
     this.selectedNode.formData.taetigkeit = formValue.taetigkeit;
     this.selectedNode.formData.anmeldezeit.stunde = formValue.anmeldezeitStunde;
     this.selectedNode.formData.anmeldezeit.minuten = formValue.anmeldezeitMinuten;
     this.selectedNode.formData.abmeldezeit.stunde = formValue.abmeldezeitStunde;
     this.selectedNode.formData.abmeldezeit.minuten = formValue.abmeldezeitMinuten;
     this.selectedNode.formData.anmerkung = formValue.anmerkung;
     this.selectedNode.formData.jiraTicket = formValue.jiraTicket;

     if (this.selectedNode.stempelzeitData) {
       const dateParts = formValue.datum.split('.');
       const day = parseInt(dateParts[0], 10);
       const month = parseInt(dateParts[1], 10) - 1;
       const year = parseInt(dateParts[2], 10);

       const loginDate = new Date(year, month, day,
         formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten);
       const logoffDate = new Date(year, month, day,
         formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten);

       this.selectedNode.stempelzeitData.login = loginDate.toISOString();
       this.selectedNode.stempelzeitData.logoff = logoffDate.toISOString();
     }
   }

   private relocateEntry(formValue: any): void {
     console.log('=== START relocateEntry ===');

     if (!this.selectedNode) return;

     const newDate = this.parseGermanDate(formValue.datum);
     if (!newDate) {
       this.snackBar.open('Ungültiges Datumformat', 'Schließen', {
         duration: 3000,
         verticalPosition: 'top'
       });
       return;
     }

     const startTime = `${String(formValue.anmeldezeitStunde).padStart(2, '0')}:${String(formValue.anmeldezeitMinuten).padStart(2, '0')}`;
     const endTime = `${String(formValue.abmeldezeitStunde).padStart(2, '0')}:${String(formValue.abmeldezeitMinuten).padStart(2, '0')}`;
     const timeRange = `${startTime} - ${endTime}`;

     const startMinutes = formValue.anmeldezeitStunde * 60 + formValue.anmeldezeitMinuten;
     const endMinutes = formValue.abmeldezeitStunde * 60 + formValue.abmeldezeitMinuten;
     const durationMinutes = endMinutes - startMinutes;
     const gebuchtHours = Math.floor(durationMinutes / 60);
     const gebuchtMins = durationMinutes % 60;
     const gebuchtTime = `${String(gebuchtHours).padStart(2, '0')}:${String(gebuchtMins).padStart(2, '0')}`;

     const loginDate = new Date(newDate);
     loginDate.setHours(formValue.anmeldezeitStunde, formValue.anmeldezeitMinuten, 0, 0);
     const logoffDate = new Date(newDate);
     logoffDate.setHours(formValue.abmeldezeitStunde, formValue.abmeldezeitMinuten, 0, 0);

     const updatedStempelzeitData = {
       id: this.selectedNode.stempelzeitData?.id || `moved-${Date.now()}`,
       version: (this.selectedNode.stempelzeitData?.version || 0) + 1,
       deleted: false,
       login: loginDate.toISOString(),
       logoff: logoffDate.toISOString(),
       zeitTyp: formValue.buchungsart,
       poKorrektur: false,
       marker: this.selectedNode.stempelzeitData?.marker || [],
       eintragungsart: this.selectedNode.stempelzeitData?.eintragungsart || 'NORMAL'
     };

     const updatedFormData = {
       datum: formValue.datum,
       buchungsart: formValue.buchungsart,
       produkt: formValue.produkt,
       produktposition: formValue.produktposition,
       buchungspunkt: formValue.buchungspunkt,
       taetigkeit: formValue.taetigkeit,
       anmeldezeit: {
         stunde: formValue.anmeldezeitStunde,
         minuten: formValue.anmeldezeitMinuten
       },
       abmeldezeit: {
         stunde: formValue.abmeldezeitStunde,
         minuten: formValue.abmeldezeitMinuten
       },
       gestempelt: gebuchtTime,
       gebucht: gebuchtTime,
       anmerkung: formValue.anmerkung || '',
       jiraTicket: formValue.jiraTicket || ''
     };

     this.deleteNodeFromTree();
     const monthYear = this.timeUtilityService.getMonthYearString(newDate);
     const monthNode = this.findOrCreateMonthNode(monthYear);
     const dayKey = this.timeUtilityService.formatDayName(newDate);
     const dayNode = this.findOrCreateDayNode(monthNode, dayKey, newDate);
     this.addActivityToDay(dayNode, updatedFormData, timeRange, updatedStempelzeitData);
     this.dataSource.data = [...this.dataSource.data];
     this.expandParentNodesForNewEntry(monthYear, dayKey);
     this.selectedNode = null;

     console.log('Entry relocated to:', monthYear, dayKey);
     console.log('=== END relocateEntry ===');
   }
   private showValidationErrors(): void {
     const errors = this.formValidationService.getValidationErrors(this.taetigkeitForm, this.fieldDisplayMap);

     if (errors.length > 0) {
       const errorMessage = this.formValidationService.formatValidationErrors(errors);
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

   async deleteEntry() {
     if (this.selectedNode && !this.isCreatingNew) {
       const nodeName = this.selectedNode.name || '';
       let entryDate = '';

       if (this.selectedNode.level === 0) {
         entryDate = this.selectedNode.monthName || '';
       } else if (this.selectedNode.level === 1) {
         entryDate = this.selectedNode.dayName || '';
       } else if (this.selectedNode.level === 2 && this.selectedNode.formData) {
         entryDate = this.selectedNode.formData.datum;
       }

       const confirmed = await this.showDeleteConfirmation(nodeName, entryDate);

       if (!confirmed) {
         console.log('Delete operation cancelled by user');
         return;
       }

       if (this.deleteNodeFromTree()) {
         this.snackBar.open('Eintrag gelöscht!', 'Schließen', {
           duration: 3000,
           verticalPosition: 'top'
         });

         this.selectedNode = null;
         this.isEditing = false;
         this.taetigkeitForm.reset();
       }
     } else if (this.isCreatingNew) {
       this.cancelFormChanges();
     }
   }

   getHour(timeType: 'anmeldezeit' | 'abmeldezeit'): number {
     const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
     return this.taetigkeitForm.get(controlName)?.value || 0;
   }

   getMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): number {
     const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
     return this.taetigkeitForm.get(controlName)?.value || 0;
   }

   increaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
     if (!this.isEditing) return;

     const hourControlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
     const minuteControlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';

     const currentHour = this.getHour(timeType);

     if (currentHour < 24) {
       const newHour = currentHour + 1;
       this.taetigkeitForm.get(hourControlName)?.setValue(newHour);

       if (newHour === 24) {
         this.taetigkeitForm.get(minuteControlName)?.setValue(0);
       }

       this.taetigkeitForm.markAsDirty();
     }
   }

   decreaseHour(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
     if (!this.isEditing) return;

     const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
     const currentHour = this.getHour(timeType);

     if (currentHour > 0) {
       this.taetigkeitForm.get(controlName)?.setValue(currentHour - 1);
       this.taetigkeitForm.markAsDirty();
     }
   }

   increaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
     if (!this.isEditing) return;

     const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
     const currentMinute = this.getMinute(timeType);
     const currentHour = this.getHour(timeType);

     if (currentHour === 24) return;

     if (currentMinute < 59) {
       this.taetigkeitForm.get(controlName)?.setValue(currentMinute + 1);
       this.taetigkeitForm.markAsDirty();
     }
   }

   decreaseMinute(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
     if (!this.isEditing) return;

     const controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
     const currentMinute = this.getMinute(timeType);
     const currentHour = this.getHour(timeType);

     if (currentHour === 24) return;

     if (currentMinute > 0) {
       this.taetigkeitForm.get(controlName)?.setValue(currentMinute - 1);
       this.taetigkeitForm.markAsDirty();
     }
   }

   validateTime(timeType: 'anmeldezeit' | 'abmeldezeit'): void {
     const hourControlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
     const minuteControlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';

     const hourControl = this.taetigkeitForm.get(hourControlName);
     const minuteControl = this.taetigkeitForm.get(minuteControlName);

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

     this.taetigkeitForm.markAsDirty();
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
       this.disableAllFormControls();
     } else {
       this.isEditing = true;
       this.enableAllFormControls();
     }
     this.cdr.detectChanges();
   }

   populateMonthForm(): void {
     if (this.selectedNode?.level === 0) {
       this.monthForm.patchValue({
         abgeschlossen: this.selectedNode.hasNotification || false,
         gebuchtTotal: this.selectedNode.gebuchtTotal || '',
         monthName: this.selectedNode.monthName || ''
       });

       this.monthForm.get('abgeschlossen')?.disable();
       this.monthForm.get('gebuchtTotal')?.disable();
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

       this.dayForm.get('abgeschlossen')?.disable();
       this.dayForm.get('gestempelt')?.disable();
       this.dayForm.get('gebucht')?.disable();
       this.dayForm.get('stempelzeiten')?.disable();
     }
   }

   onCheckboxChange(event: any): void {
     if (this.selectedNode && this.isEditing) {
       this.selectedNode.hasNotification = event.checked;
       console.log('Checkbox changed:', event.checked);
     }
   }

   private async showDeleteConfirmation(entryName: string, entryDate?: string): Promise<boolean> {
     const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
       width: '450px',
       panelClass: 'confirmation-dialog-panel',
       data: {
         title: 'Löschen bestätigen',
         message: `Wollen Sie den Eintrag "${entryName}"${entryDate ? ` (${entryDate})` : ''} wirklich löschen?`,
         confirmText: 'Ja',
         cancelText: 'Nein'
       }
     });

     const result = await dialogRef.afterClosed().toPromise();
     return result === true;
   }

 private deleteNodeFromTree(): boolean {
     if (this.treeNodeService.deleteNodeFromTree(this.dataSource.data, this.selectedNode)) {
       this.dataSource.data = [...this.dataSource.data];
       return true;
     }
     return false;
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
       this.populateForm(this.selectedNode.formData);
     } else if (this.selectedNode.level === 0) {
       this.populateMonthForm();
     } else if (this.selectedNode.level === 1) {
       this.populateDayForm();
     }

     this.isEditing = false;
     this.isNewlyCreated = false;

     if (this.selectedNode.level === 2) {
       this.taetigkeitForm.get('jiraTicket')?.disable();
     }

     if (this.selectedNode.level === 0) {
       this.monthForm.get('abgeschlossen')?.disable();
       this.monthForm.get('gebuchtTotal')?.disable();
     } else if (this.selectedNode.level === 1) {
       this.dayForm.get('abgeschlossen')?.disable();
       this.dayForm.get('gestempelt')?.disable();
       this.dayForm.get('gebucht')?.disable();
       this.dayForm.get('stempelzeiten')?.disable();
     }
   }
 }

   saveMonthChanges(): void {
     if (this.monthForm.valid && this.selectedNode?.level === 0) {
       const formValue = this.monthForm.value;

       this.selectedNode.hasNotification = formValue.abgeschlossen;
       this.selectedNode.gebuchtTotal = formValue.gebuchtTotal;

       this.snackBar.open('Monatsänderungen gespeichert!', 'Schließen', {
         duration: 3000,
         verticalPosition: 'top'
       });

       this.isEditing = false;
       this.disableAllFormControls();
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

       this.snackBar.open('Tagesänderungen gespeichert!', 'Schließen', {
         duration: 3000,
         verticalPosition: 'top'
       });

       this.isEditing = false;
       this.disableAllFormControls();
       this.dataSource.data = [...this.dataSource.data];
     }
   }

 enableAllFormControls(): void {
  if (this.selectedNode?.level === 0) {
    this.monthForm.get('abgeschlossen')?.enable();
    this.monthForm.get('gebuchtTotal')?.enable();
  } else if (this.selectedNode?.level === 1) {
    this.dayForm.get('abgeschlossen')?.enable();
    this.dayForm.get('gestempelt')?.enable();
    this.dayForm.get('gebucht')?.enable();
    this.dayForm.get('stempelzeiten')?.enable();
  } else if (this.selectedNode?.level === 2) {
    Object.keys(this.taetigkeitForm.controls).forEach(key => {
      if (key !== 'gestempelt' && key !== 'gebucht') {
        this.taetigkeitForm.get(key)?.enable();
      }
    });
  }
}

  disableAllFormControls(): void {
  if (this.selectedNode?.level === 0) {
    this.monthForm.get('abgeschlossen')?.disable();
    this.monthForm.get('gebuchtTotal')?.disable();
  } else if (this.selectedNode?.level === 1) {
    this.dayForm.get('abgeschlossen')?.disable();
    this.dayForm.get('gestempelt')?.disable();
    this.dayForm.get('gebucht')?.disable();
    this.dayForm.get('stempelzeiten')?.disable();
  } else if (this.selectedNode?.level === 2) {
    Object.keys(this.taetigkeitForm.controls).forEach(key => {
      this.taetigkeitForm.get(key)?.disable();
    });
  }
}


 addTimeEntryFromHeader() {
 if (this.showRightPanelAlarmActions || this.isCreatingNewThirdLevel) {
    this.resetAlarmState();
  }
   if (this.isCreatingNew || this.isNewlyCreated) {
     this.cancelFormChanges();
   }

   const currentTime = new Date();
   const currentDateString = currentTime.toLocaleDateString('de-DE');
   this.isCreatingNew = true;
   this.isNewlyCreated = true;
   this.showRightPanelAlarmActions = false;
   this.isEditing = true;

   this.taetigkeitForm.reset();

   Object.keys(this.taetigkeitForm.controls).forEach(key => {
     this.taetigkeitForm.get(key)?.enable();
   });

   this.taetigkeitForm.patchValue({
     datum: currentDateString,
     buchungsart: 'ARBEITSZEIT',
     produkt: '',
     produktposition: '',
     buchungspunkt: '',
     taetigkeit: '',
     anmeldezeitStunde: 0,
     anmeldezeitMinuten: 0,
     abmeldezeitStunde: 0,
     abmeldezeitMinuten: 0,
     anmerkung: '',
     jiraTicket: ''
   });

   this.selectedNode = {
     level: 2,
     expandable: false,
     name: 'Neue Tätigkeit',
     hasNotification: false,
     formData: {
       datum: currentDateString,
       buchungsart: 'ARBEITSZEIT',
       produkt: '',
       produktposition: '',
       buchungspunkt: '',
       taetigkeit: '',
       anmeldezeit: { stunde: 0, minuten: 0 },
       abmeldezeit: { stunde: 0, minuten: 0 },
       gestempelt: '00:00',
       gebucht: '00:00',
       anmerkung: '',
       jiraTicket: ''
     }
   } as FlatNode;

   this.taetigkeitForm.markAsPristine();

   console.log('New entry form opened from header');
   console.log('=== END addTimeEntryFromHeader ===');
 }

 private validateTimeEntryOverlap(formValue: any): { isValid: boolean; errorMessage?: string } {
     return this.timeOverlapService.validateTimeEntryOverlap(
       formValue,
       this.dataSource.data,
       this.selectedNode?.stempelzeitData?.id
     );
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
  private formatTime(date: Date): string {
   return date.toLocaleTimeString('de-DE', {
     hour: '2-digit',
     minute: '2-digit',
     hour12: false
   });
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
   increaseAlarmHour() {
     const currentHour = this.getAlarmHour();
     if (currentHour < 24) {
       const newHour = currentHour + 1;
       this.alarmForm.get('durationStunde')?.setValue(newHour);

       if (newHour === 24) {
         this.alarmForm.get('durationMinuten')?.setValue(0);
       }

       this.alarmForm.markAsDirty();
     }
   }

   decreaseAlarmHour() {
     const currentHour = this.getAlarmHour();
     if (currentHour > 0) {
       this.alarmForm.get('durationStunde')?.setValue(currentHour - 1);
       this.alarmForm.markAsDirty();
     }
   }

   increaseAlarmMinute() {
     const currentMinute = this.getAlarmMinute();
     const currentHour = this.getAlarmHour();

     if (currentHour === 24) return;

     if (currentMinute < 59) {
       this.alarmForm.get('durationMinuten')?.setValue(currentMinute + 1);
       this.alarmForm.markAsDirty();
     }
   }

   decreaseAlarmMinute() {
     const currentMinute = this.getAlarmMinute();
     const currentHour = this.getAlarmHour();

     if (currentHour === 24) return;

     if (currentMinute > 0) {
       this.alarmForm.get('durationMinuten')?.setValue(currentMinute - 1);
       this.alarmForm.markAsDirty();
     }
   }

   validateAlarmTime() {
     const hourControl = this.alarmForm.get('durationStunde');
     const minuteControl = this.alarmForm.get('durationMinuten');

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

     this.alarmForm.markAsDirty();
   }
   getAlarmHour(): number {
     return this.alarmForm.get('durationStunde')?.value || 0;
   }
   getAlarmMinute(): number {
     return this.alarmForm.get('durationMinuten')?.value || 0;
   }
getFullDayOfWeekFromNode(node: FlatNode | null): string {
  if (!node) return '';

  const sourceString = node.dayName || node.name || '';

  if (!sourceString) return '';

  // The format is: "So.  09. November" (note: period after day abbrev and 2 spaces)
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
 }
