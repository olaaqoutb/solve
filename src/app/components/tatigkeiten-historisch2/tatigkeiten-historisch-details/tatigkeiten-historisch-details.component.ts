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

// import {TatigkeitenHistorischTwoService} from '../../../services/tatigkeiten-historisch-two.service';
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
import { forkJoin } from 'rxjs';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FlatNode } from '../../../models/Flat-node';
import { TaetigkeitNode } from '../../../models/TaetigkeitNode';
import { FormValidationService } from '../../../services/utils/form-validation.service';
import { TimeUtilityService } from '../../../services/utils/time-utility.service';
import { TreeNodeService } from '../../../services/utils/tree-node.service';
import { DropdownExtractorService } from '../../../services/utils/dropdown-extractor.service';
import { DateParserService } from '../../../services/utils/date-parser.service';
// import { MatDatepicker } from "@angular/material/datepicker";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../../services/custom-date-adapter.service'; // adjust path as needed
// Add these imports at the top of the file
import { ActivityFormService } from '../../../services/utils/activity-form.service';
// import { TimeInputService } from '../../../services/utils/time-input.service';
import { NotificationService } from '../../../services/utils/notification.service';
import { DialogService } from '../../../services/utils/dialog.service';
import { ApiProdukt } from '../../../models-2/ApiProdukt';
import { ApiProduktPositionBuchungspunkt } from '../../../models-2/ApiProduktPositionBuchungspunkt';
import { ApiProduktPosition } from '../../../models-2/ApiProduktPosition';
import { TreeManagementService } from '../../../services/utils/tree-management.service';
import { ApiTaetigkeitTyp, getApiTaetigkeitTypDisplayValues } from '../../../models-2/ApiTaetigkeitTyp';
import { ApiBuchungsart, getApiBuchungsartDisplayValues } from '../../../models-2/ApiBuchungsart';
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
  selector: 'app-tatigkeiten-historisch-details',
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
    ConfirmationDialogComponent
    ,
     MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
  ]
  ,
  templateUrl: './tatigkeiten-historisch-details.component.html',
  styleUrl: './tatigkeiten-historisch-details.component.scss'
})
export class TatigkeitenHistorischDetailsComponent {
 buchungsartOptions = Object.values(ApiBuchungsart);
  produktOptions: ApiProdukt[] = [];
   produktpositionOptions: ApiProduktPosition[] = [];
   buchungspunktOptions: ApiProduktPositionBuchungspunkt[] = [];
taetigkeitOptions = Object.values(ApiTaetigkeitTyp);
  dropdownOptions: string[] = ["2025","2024"];
  selectedOption: string = this.dropdownOptions[0];

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

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
     buchungspunkt: node.buchungspunkt,
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

  taetigkeitForm: FormGroup;
  selectedNode: FlatNode | null = null;
  isEditing = false;
  isLoading = true;
  personName: string = '';
  isCreatingNew = false;
  monthForm: FormGroup;
  dayForm: FormGroup;

  // Field display name mapping for validation errors
  private fieldDisplayMap: { [key: string]: string } = {
    'datum': 'Datum',
    'buchungsart': 'Buchungsart',
    'anmeldezeitStunde': 'Anmeldezeit Stunde',
    'anmeldezeitMinuten': 'Anmeldezeit Minuten',
    'abmeldezeitStunde': 'Abmeldezeit Stunde',
    'abmeldezeitMinuten': 'Abmeldezeit Minuten',
    'anmerkung': 'Anmerkung'
  };
  private readonly personRequest = {
    detail: 'FullPvTlName',
    berechneteStunden: true,
    addVertraege: false
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dummyService: DummyService,
    // private dummyService:TatigkeitenHistorischTwoService,
    private formValidationService: FormValidationService,
    private timeUtilityService: TimeUtilityService,

  private treeNodeService: TreeNodeService,
  private dropdownExtractorService: DropdownExtractorService,
  private dateParserService: DateParserService,
  private activityFormService: ActivityFormService,
  // private timeInputService: TimeInputService,
  private notificationService: NotificationService,
  private dialogService: DialogService,
  private  treeManagementService:TreeManagementService,
  ) {
   this.taetigkeitForm = this.activityFormService.createActivityForm();
this.monthForm = this.activityFormService.createMonthForm();
this.dayForm = this.activityFormService.createDayForm();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const personId = params.get('id');
      if (personId) {
        this.loadData(personId);
      }
    });
  }

  loadData(personId: string) {
    this.isLoading = true;


      const startDate = `${this.selectedOption}-01-01`;  //using year from the selected dropdown
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
              console.log('TREE DATA:', treeData);
              console.log('Products count:', results.products.length);
console.log('Stempelzeiten count:', results.stempelzeiten.length);

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
      console.log('Abschluss info from dummy:', info);
      this.isLoading = false;
    },
    error: () => this.isLoading = false
  });
  }

 extractDropdownOptions(products: ApiProdukt[]) {
  const options = this.dropdownExtractorService.extractDropdownOptions(products);
  this.produktpositionOptions = options.produktpositionOptions;
  this.buchungspunktOptions = options.buchungspunktOptions;

  console.log('Extracted positions:', this.produktpositionOptions);
  console.log('Extracted buchungspunkte:', this.buchungspunktOptions);
}

 getDateFromFormattedDay(dayString: string): Date {
  return this.dateParserService.getDateFromFormattedDay(dayString);
}

  goBackToList() {
    this.router.navigate(['/activities-history']);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  onNodeClick(node: FlatNode) {
    console.log('Node clicked:', node.level, node.name);

    if (this.selectedNode !== node) {
      this.isEditing = false;
    }

    this.selectedNode = node;

    if (node.level === 2 && node.formData) {
      this.populateForm(node.formData);
    } else if (node.level === 0) {
      this.populateMonthForm();
    } else if (node.level === 1) {
      this.populateDayForm();
    }

    if (this.selectedNode !== node) {
      this.disableAllFormControls();
    }
      this.disableAllFormControls();

  }

populateForm(formData: any) {
  this.activityFormService.populateActivityForm(this.taetigkeitForm, formData);
}

 populateMonthForm(): void {
  if (this.selectedNode?.level === 0) {
    this.activityFormService.populateMonthForm(this.monthForm, this.selectedNode);
    this.monthForm.get('abgeschlossen')?.disable();
    this.monthForm.get('gebuchtTotal')?.disable();
  }
}

populateDayForm(): void {
  if (this.selectedNode?.level === 1) {
    this.activityFormService.populateDayForm(this.dayForm, this.selectedNode);
    this.dayForm.get('abgeschlossen')?.disable();
    this.dayForm.get('gestempelt')?.disable();
    this.dayForm.get('gebucht')?.disable();
    this.dayForm.get('stempelzeiten')?.disable();
  }
}

  onCheckboxChange(event: MatCheckboxChange): void {
    if (this.selectedNode && this.isEditing) {
      this.selectedNode.hasNotification = event.checked;
      console.log('Checkbox changed:', event.checked);
    }
  }

disableAllFormControls(): void {
  if (this.selectedNode?.level === 0) {
    this.formValidationService.disableAllFormControls(this.monthForm);
  } else if (this.selectedNode?.level === 1) {
    this.formValidationService.disableAllFormControls(this.dayForm);
  } else if (this.selectedNode?.level === 2) {
    this.formValidationService.disableAllFormControls(this.taetigkeitForm);
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
}
