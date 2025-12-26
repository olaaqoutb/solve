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
import { MatCheckbox } from "@angular/material/checkbox";
import { forkJoin } from 'rxjs';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FlatNode } from '../../../models/Flat-node';
import { TaetigkeitNode } from '../../../models/TaetigkeitNode';

// Importutility services
import { FormValidationService } from '../../../services/utils/form-validation.service';
import { TimeUtilityService } from '../../../services/utils/time-utility.service';
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
    ConfirmationDialogComponent
  ],
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
  // Add new properties for alarm state
  // showAlarmActionButtons = false;
  isCreatingNewThirdLevel = false;
  alarmNode: FlatNode | null = null;
  // Add a new property to track if we're in alarm mode for the right panel
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
      // Add alarm-specific properties
      hasAlarm: node.hasAlarm || false,
      alarmData: node.alarmData || null
    };

    return flatNode;
  };

  // Add method to handle alarm icon click
  // onAlarmClick(node: FlatNode, event?: Event) {
  //   if (event) {
  //     event.stopPropagation(); // Prevent node selection
  //   }

  //   if (node.level === 1) { // Day level
  //     this.alarmNode = node;
  //     this.isCreatingNewThirdLevel = true;
  //     this.showRightPanelAlarmActions = true;

  //     // Create a new empty form for the third level
  //     this.createNewThirdLevelForm(node);
  //   }
  // }
  // Method to create a new third level form
  // Updated createNewThirdLevelForm method
  createNewThirdLevelForm(parentNode: FlatNode) {
    console.log('Creating new alarm form for parent:', parentNode);

    // Reset the alarm form
    this.alarmForm.reset();

    // Extract date from parent node
    const parentDate = this.getDateFromFormattedDay(parentNode.dayName || '');
    const formattedDate = parentDate.toLocaleDateString('de-DE');

    console.log('Parent date:', formattedDate);

    // Set default values
    this.alarmForm.patchValue({
      datum: formattedDate, // Hidden - stored internally
      buchungsart: 'ARBEITSZEIT',
      produkt: '',
      produktposition: '',
      buchungspunkt: '',
      taetigkeit: '',
      durationStunde: 0, // Start with 0 duration
      durationMinuten: 0,
      anmerkung: '',
      jiraTicket: ''
    });

    console.log('Alarm form initialized:', this.alarmForm.value);
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

    // Check if values are within valid ranges
    if (anmeldezeitStunde < 0 || anmeldezeitStunde > 24 ||
      abmeldezeitStunde < 0 || abmeldezeitStunde > 24 ||
      anmeldezeitMinuten < 0 || anmeldezeitMinuten > 59 ||
      abmeldezeitMinuten < 0 || abmeldezeitMinuten > 59) {
      console.log('Time range validation failed');
      return false;
    }

    // Check if hour is 24, minutes must be 0
    if ((anmeldezeitStunde === 24 && anmeldezeitMinuten !== 0) ||
      (abmeldezeitStunde === 24 && abmeldezeitMinuten !== 0)) {
      console.log('Hour 24 validation failed - minutes must be 0');
      return false;
    }

    // Convert to total minutes for comparison
    const startTotalMinutes = anmeldezeitStunde * 60 + anmeldezeitMinuten;
    const endTotalMinutes = abmeldezeitStunde * 60 + abmeldezeitMinuten;

    console.log('Time comparison:', { startTotalMinutes, endTotalMinutes });

    // Allow equal times (00:00 - 00:00 is valid)
    if (startTotalMinutes === endTotalMinutes) {
      console.log('Times are equal - valid');
      return true;
    }

    // End time must be greater than start time
    const isValid = endTotalMinutes > startTotalMinutes;
    console.log('Time sequence validation:', isValid);
    return isValid;
  }
  approveNewThirdLevel() {
    if (!this.alarmForm || !this.alarmNode) return;

    // Validate alarm form
    this.formValidationService.validateAllFields(this.alarmForm);

    if (!this.alarmForm.valid) {
      this.showAlarmFormValidationErrors();
      return;
    }

    const formValue = this.alarmForm.value;

    // Get date from alarm node
    const selectedDate = this.getDateFromFormattedDay(this.alarmNode.dayName || '');
    const formattedDate = selectedDate.toLocaleDateString('de-DE');

    // Calculate start time as 00:00 of the selected day
    const startHour = 0;
    const startMinute = 0;

    // Calculate end time based on duration
    const durationHours = formValue.durationStunde || 0;
    const durationMinutes = formValue.durationMinuten || 0;

    // Total minutes
    const totalMinutes = startMinute + durationMinutes;
    const totalHours = startHour + durationHours + Math.floor(totalMinutes / 60);
    const finalMinutes = totalMinutes % 60;

    const endHour = Math.min(totalHours, 24); // Cap at 24
    const endMinute = endHour === 24 ? 0 : finalMinutes;

    // Validate that duration is not zero
    if (durationHours === 0 && durationMinutes === 0) {
      this.snackBar.open(
        'Bitte geben Sie eine gültige Dauer ein',
        'Schließen',
        { duration: 5000, verticalPosition: 'top' }
      );
      return;
    }

    // Validate time with overlap check
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

    // Create new activity data
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

    // Find or create month and day nodes
    const monthYear = this.timeUtilityService.getMonthYearString(selectedDate);
    const monthNode = this.findOrCreateMonthNode(monthYear);
    const dayKey = this.timeUtilityService.formatDayName(selectedDate);
    const dayNode = this.findOrCreateDayNode(monthNode, dayKey, selectedDate);

    // Add the new entry to the day node
    this.addActivityToDay(dayNode, newActivityData, timeRange, newStempelzeitData);

    // Refresh tree
    this.dataSource.data = [...this.dataSource.data];

    // Expand parent nodes
    this.expandParentNodesForNewEntry(monthYear, dayKey);

    // Show success message
    this.snackBar.open('Neue Tätigkeit erfolgreich erstellt!', 'Schließen', {
      duration: 3000,
      verticalPosition: 'top'
    });

    // Reset alarm state
    this.resetAlarmState();
  }

  private findOrCreateMonthNode(monthYear: string): TaetigkeitNode {
    // Try to find existing month node
    let monthNode = this.dataSource.data.find(node => node.name === monthYear);

    if (!monthNode) {
      // Create new month node
      monthNode = {
        name: monthYear,
        monthName: monthYear,
        gebuchtTotal: '00:00',
        hasNotification: false,
        children: [],
        hasAlarm: false,
        alarmData: null
      };

      // Add to data source
      this.dataSource.data.push(monthNode);

      // Sort months by date
      this.dataSource.data.sort((a, b) => {
        const dateA = this.timeUtilityService.parseMonthYearString(a.name || '');
        const dateB = this.timeUtilityService.parseMonthYearString(b.name || '');
        return dateB.getTime() - dateA.getTime();
      });

      console.log('Created new month node:', monthYear);
    }

    return monthNode;
  }

  private findOrCreateDayNode(monthNode: TaetigkeitNode, dayKey: string, date: Date): TaetigkeitNode {
    if (!monthNode.children) {
      monthNode.children = [];
    }

    // Try to find existing day node
    let dayNode = monthNode.children.find(node => node.dayName === dayKey);

    if (!dayNode) {
      // Create new day node
      dayNode = {
        name: dayKey,
        dayName: dayKey,
        gestempelt: '00:00',
        gebucht: '00:00',
        hasNotification: false,
        stempelzeitenList: [],
        children: [],
        hasAlarm: false,
        alarmData: null
      };

      monthNode.children.push(dayNode);

      // Sort days by date
      monthNode.children.sort((a, b) => {
        const dateA = this.getDateFromFormattedDay(a.name || '');
        const dateB = this.getDateFromFormattedDay(b.name || '');
        return dateB.getTime() - dateA.getTime();
      });

      console.log('Created new day node:', dayKey);
    }

    return dayNode;
  }

  private addActivityToDay(dayNode: TaetigkeitNode, formData: any, timeRange: string, stempelzeitData?: any): void {
    if (!dayNode.children) {
      dayNode.children = [];
    }

    const newChild: TaetigkeitNode = {
      name: `${formData.produkt || 'Unbenannt'} ${formData.produktposition || ''}`.trim(),
      productName: formData.produkt || 'Unbenannt',
      positionName: formData.produktposition || '',
      gebuchtTime: formData.gebucht,
      timeRange: timeRange,
      formData: formData,
      stempelzeitData: stempelzeitData, // Add stempelzeit data for overlap checking
      children: [],
      hasAlarm: false,
      alarmData: null
    };

    dayNode.children.push(newChild);

    // Update parent's gebucht time
    this.updateParentTimes(dayNode);

    console.log('Added new activity to day:', dayNode.dayName);
  }

  private expandParentNodesForNewEntry(monthYear: string, dayKey: string): void {
    console.log('Expanding parent nodes for:', { monthYear, dayKey });

    // Wait for tree to update
    setTimeout(() => {
      const flatNodes = this.treeControl.dataNodes;

      // Find and expand month node
      const monthNode = flatNodes.find(node =>
        node.level === 0 && node.name === monthYear
      );
      if (monthNode && !this.treeControl.isExpanded(monthNode)) {
        this.treeControl.expand(monthNode);
        console.log('Expanded month node:', monthYear);
      }

      // Find and expand day node
      const dayNode = flatNodes.find(node =>
        node.level === 1 && node.dayName === dayKey
      );
      if (dayNode && !this.treeControl.isExpanded(dayNode)) {
        this.treeControl.expand(dayNode);
        console.log('Expanded day node:', dayKey);
      }
    }, 100);
  }
  // Method to cancel (X) the new third level
  cancelNewThirdLevel() {
    this.resetAlarmState();
    this.alarmForm.reset();
  }


  // Helper method to reset alarm state
  private resetAlarmState() {
    this.isCreatingNewThirdLevel = false;
    this.alarmNode = null;
    this.showRightPanelAlarmActions = false;
    this.alarmForm.reset();
  }
  // Add method for alarm form validation errors
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
  // Method to add new third level to tree
  private addNewThirdLevelToTree(parentNode: FlatNode, formData: any, timeRange: string) {
    const newChild: TaetigkeitNode = {
      name: `${formData.produkt || 'Unbenannt'} ${formData.produktposition || ''}`.trim(),
      productName: formData.produkt || 'Unbenannt',
      positionName: formData.produktposition || '',
      gebuchtTime: formData.gebucht,
      timeRange: timeRange,
      formData: formData,
      children: [],
      // Add missing required properties
      hasAlarm: false,
      alarmData: null
    };

    // Find and update the parent node
    const updateNode = (nodes: TaetigkeitNode[]): boolean => {
      for (const node of nodes) {
        // Check if node matches day name AND has the level property (if available)
        // Since TaetigkeitNode doesn't have 'level', we check dayName instead
        if (node.dayName === parentNode.dayName) {
          if (!node.children) {
            node.children = [];
          }
          node.children.push(newChild);

          // Update parent's gebucht time
          this.updateParentTimes(node);
          return true;
        }

        if (node.children && updateNode(node.children)) {
          return true;
        }
      }
      return false;
    };

    if (updateNode(this.dataSource.data)) {
      // Refresh the tree
      this.dataSource.data = [...this.dataSource.data];

      // Expand the parent node to show the new child
      const parentFlatNode = this.treeControl.dataNodes.find(node =>
        node.dayName === parentNode.dayName && node.level === 1
      );
      if (parentFlatNode && !this.treeControl.isExpanded(parentFlatNode)) {
        this.treeControl.expand(parentFlatNode);
      }
    }
  }

  private updateParentTimes(dayNode: TaetigkeitNode) {
    if (!dayNode.children || dayNode.children.length === 0) return;

    // Calculate total time from all children
    let totalMinutes = 0;
    dayNode.children.forEach(child => {
      if (child.formData) {
        const [hours, minutes] = (child.formData.gebucht || '00:00').split(':');
        totalMinutes += parseInt(hours) * 60 + parseInt(minutes);
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    dayNode.gebucht = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
  employeeName: string = '';
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
  alarmForm: FormGroup;

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

  ) {
    this.taetigkeitForm = this.createForm();
    this.monthForm = this.createMonthForm();
    this.dayForm = this.createDayForm();
    this.alarmForm = this.createForm(); // Initialize alarm form
    this.alarmForm = this.createAlarmForm(); // Use separate method

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const employeeId = params.get('id');
      if (employeeId) {
        this.loadData(employeeId);
        this.getEmployeeName(employeeId);
      }
    });
  }
  // Create alarm form with duration fields
  private createAlarmForm(): FormGroup {
    return this.fb.group({
      datum: [''], // Hidden field - will be set from parent day
      buchungsart: ['ARBEITSZEIT', Validators.required],
      produkt: [''],
      produktposition: [''],
      buchungspunkt: [''],
      taetigkeit: [''],
      durationStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]], // Duration hours
      durationMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]], // Duration minutes
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
      datum: ['', Validators.required], // Hidden/disabled field for internal use
      buchungsart: ['ARBEITSZEIT', Validators.required], // Default to ARBEITSZEIT
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
        this.employeeName = `${person.vorname} ${person.nachname}`;

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
  }

  extractDropdownOptions(products: any[]) {
    const positionsSet = new Set<string>();
    const buchungspunkteSet = new Set<string>();

    products.forEach(product => {
      if (product.produktPosition) {
        product.produktPosition.forEach((position: any) => {
          if (position.produktPositionname) {
            positionsSet.add(position.produktPositionname);
          }

          if (position.produktPositionBuchungspunkt) {
            position.produktPositionBuchungspunkt.forEach((bp: any) => {
              if (bp.buchungspunkt) {
                buchungspunkteSet.add(bp.buchungspunkt);
              }
            });
          }
        });
      }
    });

    this.produktpositionOptions = Array.from(positionsSet).map(name => ({
      produktPositionName: name
    }));

    this.buchungspunktOptions = Array.from(buchungspunkteSet).map(name => ({
      buchungspunktName: name
    }));

    console.log('Extracted positions:', this.produktpositionOptions);
    console.log('Extracted buchungspunkte:', this.buchungspunktOptions);
  }

  transformToTreeStructure(products: any[], stempelzeiten: any[]): TaetigkeitNode[] {
    console.log('=== TRANSFORM START ===');
    console.log('Products:', products.length);
    console.log('Stempelzeiten:', stempelzeiten.length);

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
    const map = new Map<string, any>();

    products.forEach(product => {
      if (!product.produktPosition) return;

      product.produktPosition.forEach((position: any) => {
        if (!position.produktPositionBuchungspunkt) return;

        position.produktPositionBuchungspunkt.forEach((buchungspunkt: any) => {
          if (!buchungspunkt.taetigkeitsbuchung) return;

          buchungspunkt.taetigkeitsbuchung.forEach((taetigkeit: any) => {
            if (taetigkeit.stempelzeit && taetigkeit.stempelzeit.id) {
              map.set(taetigkeit.stempelzeit.id, {
                produktKurzName: product.kurzName,
                produktName: product.produktname,
                positionName: position.produktPositionname,
                buchungspunkt: buchungspunkt.buchungspunkt,
                taetigkeit: taetigkeit.taetigkeit
              });
            }
          });
        });
      });
    });

    console.log('Mapped stempelzeiten to products:', map.size, 'entries');
    return map;
  }

  createStempelzeitenList(entries: any[]): string[] {
    if (entries.length === 1) {
      const entry = entries[0];
      const loginTime = new Date(entry.login);
      const logoffTime = new Date(entry.logoff);
      // Using TimeUtilityService
      const timeRange = `${this.timeUtilityService.formatTime(loginTime)} - ${this.timeUtilityService.formatTime(logoffTime)}`;
      return [`Stempelzeiten: ${timeRange}`];
    } else if (entries.length > 1) {
      const combinedTimeRanges = entries.map(entry => {
        const loginTime = new Date(entry.login);
        const logoffTime = new Date(entry.logoff);
        // Using TimeUtilityService
        return `${this.timeUtilityService.formatTime(loginTime)} - ${this.timeUtilityService.formatTime(logoffTime)}`;
      }).join(', ');

      return [`Stempelzeiten: ${combinedTimeRanges}`];
    }

    return [];
  }

  calculateGestempelt(login: Date, logoff: Date): string {
    const diffMs = logoff.getTime() - login.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getDateFromFormattedDay(dayString: string): Date {
    const parts = dayString.split(/\s+/).filter(p => p);
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

  getEmployeeName(employeeId: string) {
    // Already set in loadData
  }

  goBackToList() {
    this.router.navigate(['/activities-history']);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  onNodeClick(node: FlatNode) {
    console.log('Node clicked:', node.level, node.name);

    // If we're in alarm mode and clicking another node, cancel alarm mode
    if (this.showRightPanelAlarmActions && node !== this.alarmNode) {
      this.resetAlarmState();
    }

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
    // Only populate the main form if we're not in alarm mode
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

      // Datum is now editable in edit mode to allow moving entries to different dates
      // this.taetigkeitForm.get('datum')?.disable();
    }
  }

  saveForm() {
    // Using FormValidationService
    this.formValidationService.validateAllFields(this.taetigkeitForm);

    if (this.taetigkeitForm.valid) {
      const formValue = this.taetigkeitForm.getRawValue();

      // USE OVERLAP VALIDATION
      const validationResult = this.validateTimeEntryOverlap(formValue);
      if (!validationResult.isValid) {
        this.snackBar.open(
          validationResult.errorMessage || 'Ungültige Zeitangaben',
          'Schließen',
          { duration: 5000, verticalPosition: 'top' }
        );
        return;
      }

      // Check if we're creating a new entry
      if (this.isCreatingNew) {
        this.saveNewEntry();
        return;
      }

      // Check if datum has changed (entry needs to be relocated)
      const originalDatum = this.selectedNode?.formData?.datum;
      const datumChanged = originalDatum && formValue.datum !== originalDatum;

      if (datumChanged) {
        // Datum has changed - relocate the entry
        this.relocateEntry(formValue);
      } else {
        // Datum hasn't changed - update in place
        this.updateExistingEntry(formValue);
      }

      this.snackBar.open('Änderungen gespeichert!', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top'
      });

      this.isEditing = false;
      this.disableAllFormControls();
    } else {
      this.showValidationErrors();
    }
  }

  private saveNewEntry(): void {
    console.log('=== START saveNewEntry ===');
    const formValue = this.taetigkeitForm.getRawValue();

    // Parse the date from the form
    const selectedDate = this.parseGermanDate(formValue.datum);
    if (!selectedDate) {
      this.snackBar.open('Ungültiges Datumformat', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Create time range string
    const startTime = `${String(formValue.anmeldezeitStunde).padStart(2, '0')}:${String(formValue.anmeldezeitMinuten).padStart(2, '0')}`;
    const endTime = `${String(formValue.abmeldezeitStunde).padStart(2, '0')}:${String(formValue.abmeldezeitMinuten).padStart(2, '0')}`;
    const timeRange = `${startTime} - ${endTime}`;

    // Calculate gebucht time (duration)
    const startMinutes = formValue.anmeldezeitStunde * 60 + formValue.anmeldezeitMinuten;
    const endMinutes = formValue.abmeldezeitStunde * 60 + formValue.abmeldezeitMinuten;
    const durationMinutes = endMinutes - startMinutes;
    const gebuchtHours = Math.floor(durationMinutes / 60);
    const gebuchtMins = durationMinutes % 60;
    const gebuchtTime = `${String(gebuchtHours).padStart(2, '0')}:${String(gebuchtMins).padStart(2, '0')}`;

    // Create stempelzeit data
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

    // Create form data for the new activity
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

    // Find or create month and day nodes
    const monthYear = this.timeUtilityService.getMonthYearString(selectedDate);
    const monthNode = this.findOrCreateMonthNode(monthYear);
    const dayKey = this.timeUtilityService.formatDayName(selectedDate);
    const dayNode = this.findOrCreateDayNode(monthNode, dayKey, selectedDate);

    // Add the new entry to the day node
    this.addActivityToDay(dayNode, newActivityData, timeRange, newStempelzeitData);

    // Refresh tree
    this.dataSource.data = [...this.dataSource.data];

    // Expand parent nodes
    this.expandParentNodesForNewEntry(monthYear, dayKey);

    // Show success message
    this.snackBar.open('Neue Tätigkeit erfolgreich erstellt!', 'Schließen', {
      duration: 3000,
      verticalPosition: 'top'
    });

    // Reset state
    this.isCreatingNew = false;
    this.isEditing = false;
    this.selectedNode = null;
    this.taetigkeitForm.reset();

    console.log('=== END saveNewEntry ===');
  }

  private updateExistingEntry(formValue: any): void {
    if (!this.selectedNode?.formData) return;

    // Update form data
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

    // Update stempelzeitData if it exists
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

    // Parse the new date
    const newDate = this.parseGermanDate(formValue.datum);
    if (!newDate) {
      this.snackBar.open('Ungültiges Datumformat', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Calculate time range and duration
    const startTime = `${String(formValue.anmeldezeitStunde).padStart(2, '0')}:${String(formValue.anmeldezeitMinuten).padStart(2, '0')}`;
    const endTime = `${String(formValue.abmeldezeitStunde).padStart(2, '0')}:${String(formValue.abmeldezeitMinuten).padStart(2, '0')}`;
    const timeRange = `${startTime} - ${endTime}`;

    const startMinutes = formValue.anmeldezeitStunde * 60 + formValue.anmeldezeitMinuten;
    const endMinutes = formValue.abmeldezeitStunde * 60 + formValue.abmeldezeitMinuten;
    const durationMinutes = endMinutes - startMinutes;
    const gebuchtHours = Math.floor(durationMinutes / 60);
    const gebuchtMins = durationMinutes % 60;
    const gebuchtTime = `${String(gebuchtHours).padStart(2, '0')}:${String(gebuchtMins).padStart(2, '0')}`;

    // Create updated stempelzeit data
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

    // Create updated form data
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

    // Remove the entry from its current location
    this.deleteNodeFromTree();

    // Find or create the new month and day nodes
    const monthYear = this.timeUtilityService.getMonthYearString(newDate);
    const monthNode = this.findOrCreateMonthNode(monthYear);
    const dayKey = this.timeUtilityService.formatDayName(newDate);
    const dayNode = this.findOrCreateDayNode(monthNode, dayKey, newDate);

    // Add the entry to the new location
    this.addActivityToDay(dayNode, updatedFormData, timeRange, updatedStempelzeitData);

    // Refresh tree
    this.dataSource.data = [...this.dataSource.data];

    // Expand parent nodes to show the relocated entry
    this.expandParentNodesForNewEntry(monthYear, dayKey);

    // Clear selection since the node has moved
    this.selectedNode = null;

    console.log('Entry relocated to:', monthYear, dayKey);
    console.log('=== END relocateEntry ===');
  }

  // Replaced with FormValidationService methods
  private showValidationErrors(): void {
    // Using FormValidationService
    const errors = this.formValidationService.getValidationErrors(this.taetigkeitForm, this.fieldDisplayMap);

    if (errors.length > 0) {
      // Using FormValidationService
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
    if (!this.selectedNode) return false;

    const removeNode = (nodes: TaetigkeitNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        const treeNode = nodes[i];

        if (this.selectedNode!.level === 0 || this.selectedNode!.level === 1) {
          if (treeNode.name === this.selectedNode!.name) {
            nodes.splice(i, 1);
            return true;
          }
        }

        if (this.selectedNode!.level === 2 && this.selectedNode!.stempelzeitData) {
          if (treeNode.stempelzeitData?.id === this.selectedNode!.stempelzeitData.id) {
            nodes.splice(i, 1);
            return true;
          }
        }

        if (treeNode.children && removeNode(treeNode.children)) {
          return true;
        }
      }
      return false;
    };

    if (removeNode(this.dataSource.data)) {
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

    // Original cancel logic...
    if (this.isCreatingNew) {
      this.selectedNode = null;
      this.isEditing = false;
      this.isCreatingNew = false;
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
      this.taetigkeitForm.get('jiraTicket')?.enable();
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
      this.taetigkeitForm.get('jiraTicket')?.disable();
    }
  }


  addTimeEntryFromHeader() {
    console.log('=== START addTimeEntryFromHeader ===');

    // Cancel any existing new entry
    if (this.isCreatingNew) {
      this.cancelFormChanges();
    }

    // Get current date
    const currentTime = new Date();
    const currentDateString = currentTime.toLocaleDateString('de-DE');

    // Set flags for regular form (NOT alarm mode)
    this.isCreatingNew = true;
    this.showRightPanelAlarmActions = false;
    this.isEditing = true;

    // Reset and setup regular form
    this.taetigkeitForm.reset();

    // Enable all form controls including datum
    Object.keys(this.taetigkeitForm.controls).forEach(key => {
      this.taetigkeitForm.get(key)?.enable();
    });

    // Set default values with current date and 0 times
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

    // Create temporary selected node for display
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

    console.log('New entry form opened from header with date:', currentDateString);
    console.log('=== END addTimeEntryFromHeader ===');
  }










  private validateTimeEntryOverlap(formValue: any): { isValid: boolean; errorMessage?: string } {
    console.log('=== VALIDATE TIME ENTRY OVERLAP ===');
    console.log('Form value for validation:', formValue);

    const {
      datum,
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    // Check if datum exists and is valid
    if (!datum || typeof datum !== 'string' || datum.trim() === '') {
      console.log('Datum validation failed - missing or empty:', datum);
      return {
        isValid: false,
        errorMessage: 'Datum ist erforderlich'
      };
    }

    // Basic time validation first
    if (!this.isTimeValid(formValue)) {
      console.log('Basic time validation failed');
      return {
        isValid: false,
        errorMessage: 'Ungültige Zeitangaben: Abmeldezeit muss nach Anmeldezeit liegen'
      };
    }

    // Parse the date
    const selectedDate = this.parseGermanDate(datum);
    if (!selectedDate) {
      console.log('Date parsing failed for:', datum);
      return {
        isValid: false,
        errorMessage: 'Ungültiges Datumformat. Bitte verwenden Sie TT.MM.JJJJ'
      };
    }

    // Create start and end time objects
    const startTime = new Date(selectedDate);
    startTime.setHours(anmeldezeitStunde, anmeldezeitMinuten, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(abmeldezeitStunde, abmeldezeitMinuten, 0, 0);

    console.log('Validating time range:', {
      start: startTime,
      end: endTime,
      selectedDate: selectedDate
    });

    // Check for overlaps with existing entries
    const overlaps = this.checkForTimeOverlaps(
      startTime,
      endTime,
      this.selectedNode?.stempelzeitData?.id
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

    const allTimeEntries: { entry: any; node: TaetigkeitNode }[] = [];

    // Collect all time entries from the tree
    const collectTimeEntries = (nodes: TaetigkeitNode[]) => {
      nodes.forEach(node => {
        if (node.stempelzeitData && node.formData) {
          allTimeEntries.push({ entry: node.stempelzeitData, node });
        }
        if (node.children) {
          collectTimeEntries(node.children);
        }
      });
    };

    collectTimeEntries(this.dataSource.data);

    console.log('Checking overlaps. Total entries:', allTimeEntries.length);

    // Check each existing entry for overlap
    for (const { entry, node } of allTimeEntries) {
      // Skip the current entry being edited
      if (excludeEntryId && entry.id === excludeEntryId) {
        console.log('Skipping current entry:', entry.id);
        continue;
      }

      const existingStart = new Date(entry.login);
      const existingEnd = new Date(entry.logoff);

      // Check if entries are on the same day
      const isSameDay =
        existingStart.toDateString() === newStart.toDateString();

      if (!isSameDay) {
        continue;
      }

      console.log('Comparing with existing entry:', {
        existing: `${this.formatTime(existingStart)} - ${this.formatTime(existingEnd)}`,
        new: `${this.formatTime(newStart)} - ${this.formatTime(newEnd)}`
      });

      // Check for overlap
      // Overlap occurs if: (newStart < existingEnd) AND (newEnd > existingStart)
      const hasOverlap =
        (newStart < existingEnd && newEnd > existingStart);

      if (hasOverlap) {
        const overlappingTime = `${this.formatTime(existingStart)} - ${this.formatTime(existingEnd)}`;
        console.log('OVERLAP FOUND:', overlappingTime);
        return {
          hasOverlap: true,
          overlappingEntry: overlappingTime
        };
      }
    }

    console.log('No overlaps found');
    return { hasOverlap: false };
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
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error('parseGermanDate: Invalid date parts', { day, month, year, original: dateString });
      return null;
    }

    // Validate ranges
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
      console.error('parseGermanDate: Date out of reasonable range', { day, month, year });
      return null;
    }

    const date = new Date(year, month, day);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('parseGermanDate: Invalid date object created', { day, month, year, result: date });
      return null;
    }

    // Check if date normalization occurred (invalid date like Feb 30)
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      console.error('parseGermanDate: Date normalization detected invalid date', {
        input: { day, month: month + 1, year },
        output: { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }
      });
      return null;
    }

    return date;
  }
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  onAlarmClick(node: FlatNode, event?: Event) {
    if (event) {
      event.stopPropagation(); // Prevent node selection
    }

    if (node.level === 1) { // Day level
      this.alarmNode = node;
      this.isCreatingNewThirdLevel = true;
      this.showRightPanelAlarmActions = true;

      // Create a new alarm form (duration-based)
      this.createNewThirdLevelForm(node);
    }
  }
  // Add these methods for alarm form time controls
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

}
