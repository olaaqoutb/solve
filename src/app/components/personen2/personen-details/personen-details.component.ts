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
import { DummyService } from '../../../services/dummy.service';
import { ApiPerson } from '../../../models-2/ApiPerson';
import { ApiVertrag } from '../../../models-2/ApiVertrag';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiGeschlecht, getApiGeschlechtDisplayValues } from '../../../models-2/ApiGeschlecht';
import { ApiMitarbeiterart, getApiMitarbeiterartDisplayValues } from '../../../models-2/ApiMitarbeiterart';
import { ApiRolle, getApiRolleDisplayValues } from '../../../models-2/ApiRolle';
import { ApiBucher, getApiBucherDisplayValues } from '../../../models-2/ApiBucher';
import { ApiDienstverwendung, getApiDienstverwendungDisplayValues } from '../../../models-2/ApiDienstverwendung';
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
    FormsModule,
    MatTooltipModule

  ],
  templateUrl: './personen-details.component.html',
  styleUrl: './personen-details.component.scss'
})
export class PersonenDetailsComponent implements OnInit, OnDestroy {

  personForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isMenuOpen = false;

  personId: string | null = null;
  currentPerson: ApiPerson | null = null;
  originalFormValues: any = null;
openVertragId: string | null = null;
openLevel1Id: { [vertragId: string]: string | null } = {};
selectedVertragId: string | null = null;

  // Panel state
  isPanelOpen = {
    personendaten: true,
    organisationsdaten: true,
    betriebsdaten: false,
    vertragsdaten: false
  };
menuItems: { label: string; action: () => void }[] = [
  { label: 'Plan-Ist Vergleich - Produkte',          action: () => this.openPlanIstVergleichProdukte() },
  { label: 'Plan-Ist Vergleich - Produkte [Vorjahr]', action: () => this.openPlanIstVergleichProdukteVorjahr() },
  { label: 'Plan-Ist Vergleich - Verträge',           action: () => this.openPlanIstVergleichVertraege() },
  { label: 'Auswertung - Person',                     action: () => this.openAuswertungPerson() },
  { label: 'Portaldeaktivierung',                     action: () => this.openPortaldeaktivierung() },
  { label: 'Logbuch',                                 action: () => this.openLogbuch() },
  { label: 'Reset',                                   action: () => this.openReset() },
];

onMenuItemClick(item: { label: string; action: () => void }): void {
  item.action();
  this.isMenuOpen = false;
}

openPlanIstVergleichProdukte(): void {
  console.log('Plan-Ist Vergleich - Produkte');
}

openPlanIstVergleichProdukteVorjahr(): void {
  console.log('Plan-Ist Vergleich - Produkte [Vorjahr]');
}

openPlanIstVergleichVertraege(): void {
  console.log('Plan-Ist Vergleich - Verträge');
}

openAuswertungPerson(): void {
  console.log('Auswertung - Person');
}

openPortaldeaktivierung(): void {
  console.log('Portaldeaktivierung');
}

openLogbuch(): void {
  console.log('Logbuch');
}

openReset(): void {
  console.log('Reset');
}
toggleMenu(): void {
  this.isMenuOpen = !this.isMenuOpen;
}

closeMenu(): void {
  this.isMenuOpen = false;
}
  vertrageData: any[] = [];
  showInactiveVertrage: boolean = false;

geschlechtOptions = this.buildOptions(ApiGeschlecht);


rolleOptions = this.buildOptions(ApiRolle);

bucherOptions = this.buildOptions(ApiBucher);

dienstverwendungOptions = this.buildOptions(ApiDienstverwendung);

mitarbeiterartOptions = this.buildOptions(ApiMitarbeiterart);



rechteOptions = [
  { value: 'STEMPELN', label: 'stempeln' },
  { value: 'FREIER_LAN_ZUGANG', label: 'freier LAN Zugang' },
  { value: 'REMOTE_USER', label: 'Remote User' },
  { value: 'BEREITSCHAFT', label: 'Bereitschaft' },
  { value: 'ONLINE_STEMPELN_HOMEOFFICE', label: 'Online Stempeln Homeoffice' },
  { value: 'ONLINE_STEMPELN_BUERO', label: 'Online Stempeln Büro' },
  { value: 'TELEARBEITER', label: 'Telearbeiter' }
];
  funktionOptions = [
    { value: 'TEAMLEITER', label: 'Teamleiter' },
    { value: 'ABTEILUNGSLEITER', label: 'Abteilungsleiter' }
  ];
geplantGebucht: number = 0;
leistungskategorieOptions: string[] = [];
  private destroy$ = new Subject<void>();


  // Add these option arrays in your component class
organisationseinheitOptions: { value: string; label: string }[] = [];
freigabegruppeOptions: { value: string; label: string }[] = [];
personenverantwortlicherOptions: { value: string; label: string }[] = [];
teamleiterOptions: { value: string; label: string }[] = [];
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dummyService: DummyService
  ) { }

  ngOnInit(): void {
  this.geschlechtOptions = this.buildOptions(ApiGeschlecht);
  this.mitarbeiterartOptions = this.buildOptions(ApiMitarbeiterart);
  this.rolleOptions = this.buildOptions(ApiRolle);
  this.bucherOptions = this.buildOptions(ApiBucher);
  this.dienstverwendungOptions = this.buildOptions(ApiDienstverwendung);

  this.initializeForm();
  this.loadLeistungskategorien();
  this.loadPersonData();
  document.addEventListener('click', this.handleOutsideClick.bind(this));
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
      document.removeEventListener('click', this.handleOutsideClick.bind(this));

  }
handleOutsideClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.burger-menu-wrapper')) {
    this.isMenuOpen = false;
  }}
  private initializeForm(): void {
    this.personForm = this.fb.group({
      // Personendaten Section
      eingabePruefung: [{ value: false, disabled: true }],
      titel: [{ value: '', disabled: true }],
vorname: [{ value: '', disabled: true }],
      nachname: [{ value: '', disabled: true }],
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
      rechte: [{ value: [], disabled: true }],
      leerPdf: [{ value: false, disabled: true }],

    });

    console.log('Form initialized');
  }

private loadPersonData(): void {
  this.personId = this.route.snapshot.paramMap.get('id');

if (!this.personId || this.personId === 'new') {
  this.personId = null;
  this.isEditMode = true;
  this.enableAllControls(this.personForm);

  setTimeout(() => {
    this.personForm.updateValueAndValidity();
  }, 0);

  return;
}

  this.isLoading = true;

  this.dummyService.getPerson2(this.personId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
     next: (person: ApiPerson) => {
  this.currentPerson = person;
  this.populateForm(person);
  this.transformContracts((person as any).vertrag || []);
  this.loadGeplantGebucht();
        console.log('JSON dienstverwendung value:', person.dienstverwendung);
        console.log('Available dienstverwendung keys:', this.dienstverwendungOptions.map(o => o.key));


  // Organisationseinheit: from person.organisationseinheit
  if (person.organisationseinheit) {
    this.organisationseinheitOptions = [{
      value: person.organisationseinheit.bezeichnung||'',
      label: person.organisationseinheit.bezeichnung||''
    }];
  }

  // Freigabegruppe: static list cuz there are not data in json file fot it
  this.freigabegruppeOptions = [
    { value: 'ARCHITEKTUR',    label: 'Architektur' },
    { value: 'ENTWICKLUNG',    label: 'Entwicklung' },
    { value: 'MANAGEMENT',     label: 'Management' },
    { value: 'INFRASTRUKTUR',  label: 'Infrastruktur' },
    { value: 'QUALITAET',      label: 'Qualität' }
  ];

  // Personenverantwortlicher: built from person.personenverantwortlicher
  if (person.personenverantwortlicher) {
    const pv = person.personenverantwortlicher as any;
    const fullName = `${pv.vorname || ''} ${pv.nachname || ''}`.trim();
    this.personenverantwortlicherOptions = [{ value: fullName, label: fullName }];
  }

  // Teamleiter: built from person.teamleiter
  if ((person as any).teamleiter) {
    const tl = (person as any).teamleiter;
    const fullName = `${tl.vorname || ''} ${tl.nachname || ''}`.trim();
    this.teamleiterOptions = [{ value: fullName, label: fullName }];
  }

  this.isLoading = false;
},
      error: (error) => {
        console.error('Error loading person data:', error);
        this.isLoading = false;
      }
    });
}

// private loadContracts(): void {
//   this.dummyService.getVertraegeVerantwortlicher2()
//     .pipe(takeUntil(this.destroy$))
//     .subscribe({
//       next: (response: any) => {  // ← use 'any' instead of ApiVertrag[]
//         console.log('Raw response:', response);

//         // Extract the vertrag array from the response
//         const contracts: ApiVertrag[] = response.vertrag || [];

//         console.log('Contracts extracted:', contracts.length);
//         this.transformContracts(contracts);
//       },
//       error: (error) => {
//         console.error('Error loading contracts:', error);
//       }
//     });
// }

private loadGeplantGebucht(): void {
  if (!this.personId) return;

  this.dummyService.getPersonGeplantGebucht1(this.personId, undefined, '2025')
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        const data = response.body;
        this.geplantGebucht = data?.geplant || 0;
      },
      error: (err) => console.error('Error loading geplantGebucht:', err)
    });
}

private loadLeistungskategorien(): void {
  this.dummyService.getAlleAktuellenLeistungskategorien2()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        const data = response.body;
        this.leistungskategorieOptions = (data?.leistungskategorie as unknown as string[]) ?? [];
      },
      error: (err) => console.error('Error loading Leistungskategorien:', err)
    });
}
private transformContracts(contracts: ApiVertrag[]): void {
  console.log('Input contracts:', JSON.stringify(contracts, null, 2));
  console.log('Transforming contracts:', contracts.length, 'contracts');

  this.vertrageData = contracts.map((contract, index) => {
    const level0 = {
      id: contract.id || index.toString(),
      title: contract.vertragsname || 'Unnamed Contract',
      geplant: contract.stundenGeplant || 0,
      gebucht: contract.stundenGebucht || 0,
      aktiv: contract.aktiv !== false,
      expanded: false,          // ← must be false
      children: [] as any[]
    };

    if (Array.isArray(contract.vertragPosition) && contract.vertragPosition.length > 0) {
      level0.children = contract.vertragPosition.map((position, posIndex) => {
        const level1 = {
          id: position.id || `${index}-${posIndex}`,
          title: position.position || 'Unnamed Position',
          volumenE: position.volumenEuro ? parseFloat(position.volumenEuro) : 0,
          volumenStd: position.volumenStunden ? parseFloat(position.volumenStunden) : 0,
          geplant: position.stundenGeplant || 0,
          aktiv: (position as any).aktiv !== false,
          expanded: false,
          children: [] as any[]
        };

        if (Array.isArray(position.vertragPositionVerbraucher) && position.vertragPositionVerbraucher.length > 0) {
          level1.children = position.vertragPositionVerbraucher.map((verbraucher: { id: any; volumenEuro: string; volumenStunden: string; stundenGeplant: any; aktiv?: boolean; }, verIndex: any) => ({
            id: verbraucher.id || `${index}-${posIndex}-${verIndex}`,
            title: this.currentPerson ?
              `${this.currentPerson.vorname} ${this.currentPerson.nachname}` :
              'Unknown Person',
            volumenE: verbraucher.volumenEuro ? parseFloat(verbraucher.volumenEuro) : 0,
            gesamt: verbraucher.volumenStunden ? parseFloat(verbraucher.volumenStunden) : 0,
            geplant: verbraucher.stundenGeplant || 0,
            aktiv: verbraucher.aktiv !== false
          }));
        }

        return level1;
      });
    }

    return level0;
  });

  this.openLevel1Id = {};
  this.openVertragId = null;

  // Auto-expand the last active level-0 → its last active level-1.
  // Falls back to last-by-index if no active items exist.
  if (this.vertrageData.length > 0) {
    const lastActiveLevel0 = [...this.vertrageData].reverse().find(v => v.aktiv !== false)
      ?? this.vertrageData[this.vertrageData.length - 1];
    lastActiveLevel0.expanded = true;
    this.openVertragId = lastActiveLevel0.id;

    if (lastActiveLevel0.children && lastActiveLevel0.children.length > 0) {
      const lastActiveLevel1 = [...lastActiveLevel0.children].reverse().find((c: any) => c.aktiv !== false)
        ?? lastActiveLevel0.children[lastActiveLevel0.children.length - 1];
      lastActiveLevel1.expanded = true;
      this.openLevel1Id[lastActiveLevel0.id] = lastActiveLevel1.id;
    }
  }

  console.log('Contracts transformed:', this.vertrageData.length, 'tree items');
  console.log('Tree structure:', this.vertrageData);
}

  private populateForm(person: ApiPerson): void {
    console.log('Populating form with person data');

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
      zimmernummer: (person as ApiPerson).zimmerNummer || '',
      freigabegruppe: person.freigabegruppe || '',
      organisationseinheit: person.organisationseinheit?.bezeichnung || '',
mitarbeiter: person.mitarbeiterart || '',

dienstverwendung: person.dienstverwendung || '',
      personenverantwortlicher: this.formatPersonName(person.personenverantwortlicher),
      teamzuordnung: person.teamzuordnung || '',
      teamleiter: this.formatPersonName(person.teamleiter),
      funktion: person.funktion || [],

      // Betriebsdaten
     personalnr: (person as any).personalnummer || (person as any).personalnr || '',

      portalUserId: person.portalUser || '',
      baksId: person.windowsBenutzerkonto || '',
      strafregisterbescheid: person.strafregisterbescheid ? this.formatDate(person.strafregisterbescheid) : '',
      interessenskonflikte: (person as ApiPerson).interessenskonflikte || '',
leistungskategorie: person.leistungskategorie || '',
      stundensatzJaehrlich: person.stundensatz || '',
      stundenkontingentJaehrlich: person.stundenkontingentJaehrlich || '',
stundenkontingentVertrag: person.stundenkontingentJaehrlichVertrag
                          || person.stundenkontingentJaehrlich
                          || '',
      bereitschaftsStundensatz: person.bereitschaftsStundensatz || '',
      selbststaendig: person.selbststaendig || false,
      beschaeftigtBei: person.firma || '',
getitRolle: person.rolle || '',
bucher: person.bucher || '',
      rechte: person.recht || [],
      leerPdf: (person as any).leerPdf || false,
    };

    this.personForm.patchValue(formData);
    this.originalFormValues = { ...formData };

    console.log('Form populated successfully');
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
    console.log('Entering edit mode');
    this.isEditMode = true;
    this.enableAllControls(this.personForm);
  }

 private enableAllControls(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.enable();
    control?.updateValueAndValidity();
  });
  formGroup.updateValueAndValidity();
}

  private exitEditMode(): void {
    console.log('Exiting edit mode');
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
 console.log('=== SAVE CLICKED ===');
  console.log('Form valid:', this.personForm.valid);
  console.log('Form status:', this.personForm.status);
   Object.keys(this.personForm.controls).forEach(key => {
    const control = this.personForm.get(key);
    if (control?.invalid) {
      console.log('Invalid control:', key, '| errors:', control.errors, '| value:', control.value, '| disabled:', control.disabled);
    }
  });
  this.personForm.markAllAsTouched();

  if (this.personForm.invalid) {
    console.log('Stopping — form invalid');
    return;
  }
    if (this.personForm.invalid) {
      console.log(' Form is invalid, not saving');
      this.personForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formValue = this.personForm.getRawValue();
    console.log('Form values to save:', formValue);

    const personData: ApiPerson = this.mapFormToApiPerson(formValue);
const isNewPerson = !this.personId;
    const saveObservable = this.personId
      ? this.dummyService.updatePerson(personData, this.personId)
      : this.dummyService.createPerson(personData);

    saveObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
       next: (response) => {
  const savedPerson = response.body as ApiPerson;
  console.log('Person saved successfully:', savedPerson);

  this.currentPerson = savedPerson;
  this.personId = savedPerson.id ?? null;

  this.populateForm(savedPerson);
  this.transformContracts((savedPerson as any).vertrag || []);
  this.loadGeplantGebucht();
  this.exitEditMode();
  this.isLoading = false;

  if (isNewPerson && savedPerson.id) {
    window.history.replaceState({}, '', `/personen/${savedPerson.id}`);
  }
},
        error: (error) => {
          console.error('Error saving person:', error);
          this.isLoading = false;
        }
      });
  }

 onCancel(): void {
  console.log('Cancel button clicked');

  if (!this.currentPerson) {
    this.router.navigate(['/personen']);
    return;
  }

  if (this.originalFormValues) {
    this.personForm.patchValue(this.originalFormValues);
    console.log('Form reset to original values');
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
      person.geprueft = formValue.eingabePruefung;
  person.anmerkung = formValue.anmerkung;
    person.email = formValue.emailGeschaeftlich;
    person.emailPrivat = formValue.emailExtern;
    person.telefonNummer = formValue.telefonnummer;
    person.mobilNummerBmi = formValue.mobilnummerBMI;
    person.mobilNummer = formValue.mobilnummerExtern;
    person.eintrittsDatum = formValue.eintrittsDatum;
    person.austrittsDatum = formValue.austrittsDatum;
      person.freigabegruppe = formValue.freigabegruppe;

    person.dienstverwendung = formValue.dienstverwendung;
      person.teamzuordnung = formValue.teamzuordnung;

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
  person.leistungskategorie = formValue.leistungskategorie;
(person as any).leerPdf = formValue.leerPdf;

    return person;
  }

  private formatDateForApi(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, '');
  }

  onBack(): void {
    console.log('Back button clicked');
    this.router.navigate(['/personen']);
  }

  togglePanel(panel: keyof typeof this.isPanelOpen): void {
    this.isPanelOpen[panel] = !this.isPanelOpen[panel];
    console.log(`Panel ${panel} is now ${this.isPanelOpen[panel] ? 'open' : 'closed'}`);
  }

  /**
   * Toggle Level 0 (Main Contract)
   */
 toggleVertrag(vertrag: any): void {
  if (this.openVertragId === vertrag.id) {
    vertrag.expanded = false;
    this.openVertragId = null;
  } else {
    if (this.openVertragId) {
      const previousVertrag = this.vertrageData.find(v => v.id === this.openVertragId);
      if (previousVertrag) {
        previousVertrag.expanded = false;
        // Also close any open level-1 inside it
        if (previousVertrag.children) {
          previousVertrag.children.forEach((child: any) => {
            child.expanded = false;
          });
        }
      }
    }

    vertrag.expanded = true;
    this.openVertragId = vertrag.id;
    // Reset level-1 tracking for this vertrag
    this.openLevel1Id[vertrag.id] = null;
  }
}

toggleLevel2(level1: any, parentVertragId: string): void {
  const currentOpenInThisVertrag = this.openLevel1Id[parentVertragId];

  if (currentOpenInThisVertrag === level1.id) {
    // Clicking the already-open level-1 — close it and its children
    level1.expanded = false;
    level1.children?.forEach((child: any) => child.expanded = false);
    this.openLevel1Id[parentVertragId] = null;
  } else {
    if (currentOpenInThisVertrag) {
      const previousLevel1 = this.vertrageData
        .find(v => v.id === parentVertragId)
        ?.children?.find((c: any) => c.id === currentOpenInThisVertrag);
      if (previousLevel1) {
        previousLevel1.expanded = false;
        previousLevel1.children?.forEach((child: any) => child.expanded = false);
      }
    }
    // Open the new one
    level1.expanded = true;
    this.openLevel1Id[parentVertragId] = level1.id;
  }
}

selectVertrag(vertragId: string, event?: Event): void {
  if (event) {
    event.stopPropagation();
  }
  this.selectedVertragId = vertragId;
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

    console.log(`Checkbox changed for ${controlName}:`, control.value);
  }

// selectVertrag(vertragId: string, event?: Event): void {
//   if (event) {
//     event.stopPropagation();
//   }
//   this.selectedVertragId = vertragId;
//   console.log('Selected vertrag:', vertragId);
// }
goToVertrag(vertragId: string, event: Event): void {
  event.stopPropagation();
  this.router.navigate(['/vertrag', vertragId]);
}
private buildOptions(enumObj: any): { key: string; label: string }[] {
  return Object.keys(enumObj).map(keyName => ({
    key: keyName,
    label: enumObj[keyName]
  }));
}
}
