import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from "@angular/common";

// Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

// Services and Models
import { PersonenTwoService } from '../../../services/personenTwo.service';
import { ApiPerson } from '../../../models-2/ApiPerson';
import { ApiVertrag } from '../../../models-2/ApiVertrag';

@Component({
  selector: 'app-personen-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatInputModule,
    MatOptionModule,
    FormsModule
  ],
  templateUrl: './personen-details.component.html',
  styleUrl: './personen-details.component.scss'
})
export class PersonenDetailsComponent implements OnInit, OnDestroy {

  personForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  personId: string | null = null;
  currentPerson: ApiPerson | null = null;
  originalFormValues: any = null;

  // Panel state
  isPanelOpen = {
    personendaten: true,
    organisationsdaten: false,
    betriebsdaten: false,
    vertragsdaten: false
  };

  // CONTRACTS DATA - NOW LOADED FROM JSON, NOT HARDCODED
  // ========================================================================

  /**
   * Contract data structure explanation:
   *
   * Level 0 (Main Contract):
   *   - vertragsname: Contract name
   *   - geplant/gebucht: Planned/Booked hours (calculated from children)
   *   - children: Array of Level 1 items
   *
   * Level 1 (Contract Position):
   *   - position: Position name
   *   - volumenE/volumenStd: Volume in euros/hours
   *   - children: Array of Level 2 items
   *
   * Level 2 (Person Assignment):
   *   - person name
   *   - volumenE: Person's allocated euros
   *   - gesamt/geplant: Total/Planned hours
   *
   * This data comes from person.vertrag[] in json1
   */
  vertrageData: any[] = [];

  // Dropdown options
  geschlechtOptions = [
    { value: 'MAENNLICH', label: 'Männlich' },
    { value: 'WEIBLICH', label: 'Weiblich' },
    { value: 'DIVERS', label: 'Divers' }
  ];

  rolleOptions = [
    { value: 'ADMIN_PROJECT_OFFICE', label: 'Admin Project Office' },
    { value: 'PROJEKTLEITER', label: 'Projektleiter' },
    { value: 'MITARBEITER', label: 'Mitarbeiter' }
  ];

  bucherOptions = [
    { value: 'GEPLANTER_BUCHER', label: 'Geplanter Bucher' },
    { value: 'FREIER_BUCHER', label: 'Freier Bucher' }
  ];

  dienstverwendungOptions = [
    { value: 'REQUIREMENTS_ENGINEER', label: 'Requirements Engineer' },
    { value: 'DEVELOPER', label: 'Developer' },
    { value: 'TESTER', label: 'Tester' }
  ];

  mitarbeiterartOptions = [
    { value: 'EXTERN', label: 'Extern' },
    { value: 'INTERN', label: 'Intern' }
  ];

  rechteOptions = [
    { value: 'STEMPELN', label: 'stempeln' },
    { value: 'REMOTE_USER', label: 'Remote User' },
    { value: 'BEREITSCHAFT', label: 'Bereitschaft' },
    { value: 'ONLINE_STEMPELN_HOMEOFFICE', label: 'Online Stempeln Homeoffice' },
    { value: 'ONLINE_STEMPELN_BUERO', label: 'Online Stempeln Büro' }
  ];

  funktionOptions = [
    { value: 'TEAMLEITER', label: 'Teamleiter' },
    { value: 'ABTEILUNGSLEITER', label: 'Abteilungsleiter' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private personenTwoService: PersonenTwoService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPersonData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.personForm = this.fb.group({
      // Personendaten Section
      eingabePruefung: [{ value: false, disabled: true }],
      titel: [{ value: '', disabled: true }],
      vorname: [{ value: '', disabled: true }, Validators.required],
      nachname: [{ value: '', disabled: true }, Validators.required],
      geburtsdatum: [{ value: '', disabled: true }],
      geschlecht: [{ value: '', disabled: true }],
      staatsangehoerigkeit: [{ value: '', disabled: true }],
      aktiv: [{ value: true, disabled: true }],
      anmerkung: [{ value: '', disabled: true }],

      // Organisationsdaten Section
      eintrittsDatum: [{ value: '', disabled: true }],
      austrittsDatum: [{ value: '', disabled: true }],
      emailGeschaeftlich: [{ value: '', disabled: true }, Validators.email],
      emailExtern: [{ value: '', disabled: true }, Validators.email],
      telefonnummer: [{ value: '', disabled: true }],
      mobilnummerBMI: [{ value: '', disabled: true }],
      mobilnummerExtern: [{ value: '', disabled: true }],
      zimmernummer: [{ value: '', disabled: true }],
      freigabegruppe: [{ value: '', disabled: true }],
      organisationseinheit: [{ value: '', disabled: true }],
      mitarbeiter: [{ value: '', disabled: true }],
      dienstverwendung: [{ value: '', disabled: true }],
      personenverantwortlicher: [{ value: '', disabled: true }],
      teamzuordnung: [{ value: '', disabled: true }],
      teamleiter: [{ value: '', disabled: true }],
      funktion: [{ value: [], disabled: true }],

      // Betriebsdaten Section
      personalnr: [{ value: '', disabled: true }],
      portalUserId: [{ value: '', disabled: true }],
      baksId: [{ value: '', disabled: true }],
      strafregisterbescheid: [{ value: '', disabled: true }],
      interessenskonflikte: [{ value: '', disabled: true }],
      leistungskategorie: [{ value: '', disabled: true }],
      stundensatzJaehrlich: [{ value: '', disabled: true }],
      stundenkontingentJaehrlich: [{ value: '', disabled: true }],
      stundenkontingentVertrag: [{ value: '', disabled: true }],
      bereitschaftsStundensatz: [{ value: '', disabled: true }],
      selbststaendig: [{ value: false, disabled: true }],
      beschaeftigtBei: [{ value: '', disabled: true }],
      getitRolle: [{ value: '', disabled: true }],
      bucher: [{ value: '', disabled: true }],
      rechte: [{ value: [], disabled: true }]
    });

    console.log('✅ Form initialized');
  }

  /**
   * Load person data from service
   * This will use json1 (person-detail.json) which includes contracts
   */
  private loadPersonData(): void {
    this.personId = this.route.snapshot.paramMap.get('id');

    console.log('📥 Loading person data for ID:', this.personId);

    if (!this.personId) {
      console.log('⚠️ No ID found - creating new person');
      return;
    }

    this.isLoading = true;

    // Call service - it will load from json1 (person-detail.json)
    this.personenTwoService.getPerson(
      this.personId,
      'FullPvTlName',
      true,
      true // addVertraege = true to get contracts
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (person: ApiPerson) => {
          console.log('✅ Person data loaded:', person);
          this.currentPerson = person;

          // Populate form with person data
          this.populateForm(person);

          // IMPORTANT: Transform contracts from API format to tree format
          this.transformContracts(Array.isArray(person.vertrag) ? person.vertrag : (person.vertrag ? [person.vertrag] : []));

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading person data:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Transform API contracts into tree structure for display
   *
   * API Structure (from json1):
   * person.vertrag[] = [
   *   {
   *     vertragsname: "BMI/IBM 2018",
   *     vertragPosition: [
   *       {
   *         position: "Betrieb Anwendung",
   *         vertragPositionVerbraucher: [
   *           { person data... }
   *         ]
   *       }
   *     ]
   *   }
   * ]
   *
   * Tree Structure (for UI):
   * vertrageData = [
   *   {
   *     title: "BMI/IBM 2018",        // Level 0
   *     children: [
   *       {
   *         title: "Betrieb Anwendung", // Level 1
   *         children: [
   *           { title: "Person Name" }    // Level 2
   *         ]
   *       }
   *     ]
   *   }
   * ]
   */
  private transformContracts(contracts: ApiVertrag[]): void {
    console.log('🔄 Transforming contracts:', contracts.length, 'contracts');

    this.vertrageData = contracts.map((contract, index) => {
      // Level 0: Main Contract
      const level0 = {
        id: contract.id || index.toString(),
        title: contract.vertragsname || 'Unnamed Contract',
        geplant: contract.stundenGeplant || 0,
        gebucht: contract.stundenGebucht || 0,
        expanded: false,
        children: [] as any[]
      };

      // Level 1: Contract Positions
      if (contract.vertragPosition && contract.vertragPosition.length > 0) {
        level0.children = contract.vertragPosition.map((position, posIndex) => {
          const level1 = {
            id: position.id || `${index}-${posIndex}`,
            title: position.position || 'Unnamed Position',
            volumenE: position.volumenEuro ? parseFloat(position.volumenEuro) : 0,
            volumenStd: position.volumenStunden ? parseFloat(position.volumenStunden) : 0,
            geplant: position.stundenGeplant || 0,
            expanded: false,
            children: [] as any[]
          };

          // Level 2: Person Assignments
          if (position.vertragPositionVerbraucher && position.vertragPositionVerbraucher.length > 0) {
            level1.children = position.vertragPositionVerbraucher.map((verbraucher: { id: any; volumenEuro: string; volumenStunden: string; stundenGeplant: any; }, verIndex: any) => ({
              id: verbraucher.id || `${index}-${posIndex}-${verIndex}`,
              title: this.currentPerson ?
                `${this.currentPerson.vorname} ${this.currentPerson.nachname}` :
                'Unknown Person',
              volumenE: verbraucher.volumenEuro ? parseFloat(verbraucher.volumenEuro) : 0,
              gesamt: verbraucher.volumenStunden ? parseFloat(verbraucher.volumenStunden) : 0,
              geplant: verbraucher.stundenGeplant || 0
            }));
          }

          return level1;
        });
      }

      return level0;
    });

    console.log('✅ Contracts transformed:', this.vertrageData.length, 'tree items');
    console.log('📊 Tree structure:', this.vertrageData);
  }

  private populateForm(person: ApiPerson): void {
    console.log('📝 Populating form with person data');

    const formData = {
      // Personendaten
      eingabePruefung: person.geprueft || false,
      titel: person.titel || '',
      vorname: person.vorname || '',
      nachname: person.nachname || '',
      geburtsdatum: person.gebdat ? this.formatDate(person.gebdat) : '',
      geschlecht: person.geschlecht || '',
      staatsangehoerigkeit: person.staatsangehoerigkeit || '',
      aktiv: person.aktiv !== undefined ? person.aktiv : true,
      anmerkung: person.anmerkung || '',

      // Organisationsdaten
      eintrittsDatum: person.eintrittsDatum ? this.formatDate(person.eintrittsDatum) : '',
      austrittsDatum: person.austrittsDatum ? this.formatDate(person.austrittsDatum) : '',
      emailGeschaeftlich: person.email || '',
      emailExtern: person.emailPrivat || '',
      telefonnummer: person.telefonNummer || '',
      mobilnummerBMI: person.mobilNummerBmi || '',
      mobilnummerExtern: person.mobilNummer || '',
      zimmernummer: '',
      freigabegruppe: person.freigabegruppe || '',
      organisationseinheit: person.organisationseinheit?.bezeichnung || '',
      mitarbeiter: person.mitarbeiterart || '',
      dienstverwendung: person.dienstverwendung || '',
      personenverantwortlicher: this.formatPersonName(person.personenverantwortlicher),
      teamzuordnung: person.teamzuordnung || '',
      teamleiter: this.formatPersonName(person.teamleiter),
      funktion: person.funktion || [],

      // Betriebsdaten
      personalnr: '',
      portalUserId: person.portalUser || '',
      baksId: person.windowsBenutzerkonto || '',
      strafregisterbescheid: person.strafregisterbescheid ? this.formatDate(person.strafregisterbescheid) : '',
      interessenskonflikte: '',
      leistungskategorie: person.leistungskategorie || '',
      stundensatzJaehrlich: person.stundensatz || '',
      stundenkontingentJaehrlich: person.stundenkontingentJaehrlich || '',
      stundenkontingentVertrag: person.stundenkontingentJaehrlichVertrag || '',
      bereitschaftsStundensatz: person.bereitschaftsStundensatz || '',
      selbststaendig: person.selbststaendig || false,
      beschaeftigtBei: person.firma || '',
      getitRolle: person.rolle || '',
      bucher: person.bucher || '',
      rechte: person.recht || []
    };

    this.personForm.patchValue(formData);
    this.originalFormValues = { ...formData };

    console.log('✅ Form populated successfully');
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';

    if (dateStr.length === 8 && !dateStr.includes('-')) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}-${month}-${day}`;
    }

    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }

    return dateStr;
  }

  private formatPersonName(person: any): string {
    if (!person) return '';
    return `${person.vorname || ''} ${person.nachname || ''}`.trim();
  }

  enterEditMode(): void {
    console.log('✏️ Entering edit mode');
    this.isEditMode = true;
    this.enableAllControls(this.personForm);
  }

  private enableAllControls(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.enable();
    });
  }

  private exitEditMode(): void {
    console.log('🚫 Exiting edit mode');
    this.isEditMode = false;
    this.disableAllControls(this.personForm);
  }

  private disableAllControls(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.disable();
    });
  }

  onSave(): void {
    console.log('💾 Save button clicked');

    if (this.personForm.invalid) {
      console.log('⚠️ Form is invalid, not saving');
      this.personForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formValue = this.personForm.getRawValue();
    console.log('📤 Form values to save:', formValue);

    const personData: ApiPerson = this.mapFormToApiPerson(formValue);

    const saveObservable = this.personId
      ? this.personenTwoService.updatePerson(personData, this.personId)
      : this.personenTwoService.createPerson(personData);

    saveObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedPerson: ApiPerson) => {
          console.log('✅ Person saved successfully:', savedPerson);
          this.currentPerson = savedPerson;
          this.populateForm(savedPerson);
          this.transformContracts(Array.isArray(savedPerson.vertrag) ? savedPerson.vertrag : (savedPerson.vertrag ? [savedPerson.vertrag] : []));
          this.exitEditMode();
          this.isLoading = false;

          if (!this.personId) {
            this.router.navigate(['/personen', savedPerson.id]);
          }
        },
        error: (error) => {
          console.error('❌ Error saving person:', error);
          this.isLoading = false;
        }
      });
  }

  onCancel(): void {
    console.log('🚫 Cancel button clicked');

    if (this.originalFormValues) {
      this.personForm.patchValue(this.originalFormValues);
      console.log('↩️ Form reset to original values');
    }

    this.exitEditMode();
  }

  private mapFormToApiPerson(formValue: any): ApiPerson {
    const person: ApiPerson = this.currentPerson ? { ...this.currentPerson } : {} as ApiPerson;

    person.titel = formValue.titel;
    person.vorname = formValue.vorname;
    person.nachname = formValue.nachname;
    person.gebdat = this.formatDateForApi(formValue.geburtsdatum);
    person.geschlecht = formValue.geschlecht;
    person.staatsangehoerigkeit = formValue.staatsangehoerigkeit;
    person.aktiv = formValue.aktiv;
    person.email = formValue.emailGeschaeftlich;
    person.emailPrivat = formValue.emailExtern;
    person.telefonNummer = formValue.telefonnummer;
    person.mobilNummerBmi = formValue.mobilnummerBMI;
    person.mobilNummer = formValue.mobilnummerExtern;
    person.eintrittsDatum = formValue.eintrittsDatum;
    person.austrittsDatum = formValue.austrittsDatum;
    person.dienstverwendung = formValue.dienstverwendung;
    person.mitarbeiterart = formValue.mitarbeiter;
    person.firma = formValue.beschaeftigtBei;
    person.selbststaendig = formValue.selbststaendig;
    person.portalUser = formValue.portalUserId;
    person.windowsBenutzerkonto = formValue.baksId;
    person.rolle = formValue.getitRolle;
    person.bucher = formValue.bucher;
    person.recht = formValue.rechte;
    person.funktion = formValue.funktion;
    person.stundensatz = formValue.stundensatzJaehrlich;
    person.stundenkontingentJaehrlich = formValue.stundenkontingentJaehrlich;
    person.stundenkontingentJaehrlichVertrag = formValue.stundenkontingentVertrag;
    person.bereitschaftsStundensatz = formValue.bereitschaftsStundensatz;

    return person;
  }

  private formatDateForApi(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, '');
  }

  onBack(): void {
    console.log('⬅️ Back button clicked');
    this.router.navigate(['/personen']);
  }

  togglePanel(panel: keyof typeof this.isPanelOpen): void {
    this.isPanelOpen[panel] = !this.isPanelOpen[panel];
    console.log(`📂 Panel ${panel} is now ${this.isPanelOpen[panel] ? 'open' : 'closed'}`);
  }

  /**
   * Toggle Level 0 (Main Contract)
   */
  toggleVertrag(vertrag: any): void {
    vertrag.expanded = !vertrag.expanded;
    console.log('🔽 Contract toggled:', vertrag.title, 'expanded:', vertrag.expanded);
  }

  /**
   * Toggle Level 1 (Contract Position)
   */
  toggleLevel2(item: any): void {
    item.expanded = !item.expanded;
    console.log('🔽 Position toggled:', item.title, 'expanded:', item.expanded);
  }

  onCheckboxChange(event: any, controlName: string, value: string): void {
    const control = this.personForm.get(controlName);
    if (!control) return;

    const currentValues: string[] = control.value || [];

    if (event.checked) {
      if (!currentValues.includes(value)) {
        control.setValue([...currentValues, value]);
      }
    } else {
      control.setValue(currentValues.filter(v => v !== value));
    }

    console.log(`☑️ Checkbox changed for ${controlName}:`, control.value);
  }
}
