// import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import {MatDialog,MatDialogModule,MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Injectable } from '@angular/core';
import { MatDateFormats, NativeDateAdapter } from '@angular/material/core';
// import { VertrageService } from '../../../services/vertrage.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FlatNode } from '../../../models/Flat-node';
import { TaetigkeitNode } from '../../../models/TaetigkeitNode';
import{DummyService}from "../../../services/dummy.service";
import { ApiVertrag } from '../../../models-2/ApiVertrag';
import { ApiVertragPosition } from '../../../models-2/ApiVertragPosition';
import{ApiVertragPositionVerbraucher}from "../../../models-2/ApiVertragPositionVerbraucher";
import{ApiStundenplanung} from "../../../models-2/ApiStundenplanung";
import { ApiPerson } from '../../../models-2/ApiPerson';
import { ApiProdukt } from '../../../models-2/ApiProdukt';
import { ApiProduktPosition } from '../../../models-2/ApiProduktPosition';
import{ApiVertragBezugsart}from"../../../models-2/ApiVertragBezugsart"
import{ApiVertragsTyp}from"../../../models-2/ApiVertragsTyp"

// import{VertraegeService}from "../../../services/vertrage.service"

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'dd.MM.yyyy') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
    return super.format(date, displayFormat);
  }
}

export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'dd.MM.yyyy',
  },
  display: {
    dateInput: 'dd.MM.yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd.MM.yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-vertrage-details',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    FormsModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatCardModule,
    MatToolbarModule,

  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  templateUrl: './vertrage-details.component.html',
  styleUrl: './vertrage-details.component.scss'
})
export class VertrageDetailsComponent implements OnInit {
  vertragForm!: FormGroup;
  positionDetailForm!: FormGroup;
  verbraucherDetailForm!: FormGroup;
  childDetailForm!: FormGroup;
  isFormEditable = false;
  isPositionFormEditable = false;
  isVerbraucherFormEditable = false;
  isChildFormEditable = false;
  saving = false;
  loading = true;
  originalVertragData: any = {};
  vertragspositionen: any[] = [];
  selectedPosition: any | null = null;
verantwortlicherOptions: { id: string; fullName: string }[] = [];
  servicemanagerOptions: string[] = [];
    vertragList: any[] = [];
  vertragPositionTypenList: any[] = [];
isNewPositionBeingCreated = false;
isNewVerbraucherBeingCreated = false;
isNewChildBeingCreated = false;
 editingNewNodeParentId: string | null = null;
 vertragId!: string;
rollenbezeichnungOptions: string[] = [];
geschaeftszahlenOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    //  private vertrageService: VertrageService,
    private dummyService: DummyService,
    //  private dummyService: VertraegeService,

  ) {}

ngOnInit(): void {
  this.vertragId = this.route.snapshot.paramMap.get('id')!;

  this.initMainForm();
  this.initPositionDetailForm();
  this.initVerbraucherDetailForm();
  this.initChildDetailForm();
  this.loadRollenbezeichnungen();

  if (!this.vertragId || this.vertragId === 'new') {
    this.vertragId = null!;
    this.isFormEditable = true;
    this.vertragForm.enable();
    this.loading = false;
    this.loadGeschaeftszahlen();
    this.loadVerantwortlicherOptions();
    return;
  }

  this.loadGeschaeftszahlen();
}
private loadVerantwortlicherOptions(): void {
  this.dummyService.getPersonen1().subscribe({
    next: (persons: any[]) => {
      this.verantwortlicherOptions = persons.map(p => ({
        id: p.id,
        fullName: `${p.vorname || ''} ${p.nachname || ''}`.trim()
      }));
    },
    error: (err) => console.error('Error loading Verantwortlicher:', err)
  });
}
 private loadGeschaeftszahlen(): void {
  this.dummyService.getAlleAktuellenGeschaeftszahlen().subscribe({
    next: (data) => {
      this.geschaeftszahlenOptions = Array.isArray(data.geschaeftszahl)
        ? data.geschaeftszahl : [];

      // Only load vertrag data if we have a real ID
      if (this.vertragId) {
        this.loadVertragData();
      }
    },
    error: (err) => console.error('Error loading Geschaeftszahlen:', err)
  });
}

private loadRollenbezeichnungen(): void {
  this.dummyService.getAlleAktuellenRollenbezeichnungen().subscribe({
    next: (data) => {
      this.rollenbezeichnungOptions = Array.isArray(data.rollenbezeichnung) ? data.rollenbezeichnung : [];
    },
    error: (err) => {
      console.error('Error loading Rollenbezeichnungen:', err);
    }
  });
}
 addVertragsposition(): void {
  this.cancelAndResetNewFlags();

  const newPosition = {
    id: `new-level1-${Date.now()}`,
    name: 'Neue Vertragsposition',
    start: undefined,
    ende: undefined,
    status: 'active',
    aktiv: true,
    typ: 'Vertragsposition',
    isExpanded: false,
    level: 1,
    auftraggeber: '',
    organisationseinheit: '',
    durchfuehrungsverantwortlicher: '',
    positionstyp: '',
    buchungsfreigabe: false,
    anmerkung: '',
    volumenEuro: 0,
    volumenStunden: 0,
    stundenGeplant: 0,
    children: [],
    isNew: true,
    isPendingCreation: true
  };
  this.selectedPosition = newPosition;
  this.isPositionFormEditable = true;
  this.positionDetailForm.enable();
  this.positionDetailForm.reset({
    aktiv: true,
    positionsbezeichnung: 'Neue Vertragsposition',
    planungsjahr: '',
    volumen: 0,
    volumenEuro: 0,
    jahresuebertrag: false,
    rollenbezRahmenvertrag: '',
    anmerkung: '',
  });

  this.isNewPositionBeingCreated = true;
  this.editingNewNodeParentId = null;
}

addVerbraucher(parentNode: any, event: Event): void {
  event.stopPropagation();
  this.cancelAndResetNewFlags();

  if (!parentNode || parentNode.level !== 1) return;

  const newVerbraucher = {
    id: `new-level2-${Date.now()}`,
    name: 'Neue Person',
    typ: 'Verbraucher',
    level: 2,
    parentId: parentNode.id,
    volumenEuro: 0,
    volumenStunden: 0,
    stundenGeplant: 0,
    aktiv: true,
    children: [],
    isNew: true,
    isPendingCreation: true
  };
  this.selectedPosition = newVerbraucher;
  this.isVerbraucherFormEditable = true;
  this.verbraucherDetailForm.enable();
  this.isNewVerbraucherBeingCreated = true;
  this.editingNewNodeParentId = parentNode.id;
}

 canAddVerbraucher(node:FlatNode): boolean {
  return node && node.level === 1;
}

canAddBuchungspunkt(node: FlatNode): boolean {
  return node && node.level === 2;
}
     addBuchungspunkt(parentNode:any, event: Event): void {
  event.stopPropagation();
  this.cancelAndResetNewFlags();

  if (!parentNode || parentNode.level !== 2) return;

  const newBuchungspunkt = {
    id: `new-level3-${Date.now()}`,
    name: 'Neuer Buchungspunkt',
    typ: 'Buchungspunkt',
    level: 3,
    parentId: parentNode.id,
    aktiv: true,
    stundenGeplant: 0,
    anmerkung: 'Neuer Buchungspunkt',
    produkt: null,
    produktposition: null,
    produktPosition: {},
    isNew: true,
    isPendingCreation: true
  };
  this.selectedPosition = newBuchungspunkt;
  this.isChildFormEditable = true;
  this.childDetailForm.enable();
  this.isNewChildBeingCreated = true;
  this.editingNewNodeParentId = parentNode.id;
}

  private initMainForm(): void {
    this.vertragForm = this.fb.group({
      vertragsname: ['', Validators.required],
      vertragszusatz: [''],
      vertragspartner: [''],
      auftraggeber: [''],
      vertragsverantwortlicher: [''],
      bezugsart: [''],
      elak: [''],
      beschaffungsnummer: [''],
      lkVertrag: [false],
      aktiv: [false],
      erstellungsdatum: [null],
      start: [null],
      ende: [null],
      vertragssumme: [''],
      auftragsreferenz: [''],
      rahmenvertragGZ: [''],
      vertragstype: [''],
      anmerkung: ['']
    });
    this.vertragForm.disable();
  }
bezugsartenOptions = [
  { value: '', label: 'Bezugsart wählen' },
  ...Object.values(ApiVertragBezugsart).map(v => ({ value: v, label: v }))
];

vertragsTypOptions = [
  { value: '', label: 'Vertragstyp wählen' },
  ...Object.values(ApiVertragsTyp).map(v => ({ value: v, label: v }))
];
  verbraucherArray=['Personal','Sachmittel'];


  private initPositionDetailForm(): void {
    this.positionDetailForm = this.fb.group({
      aktiv: [false],
      positionsbezeichnung: [''],
      planungsjahr: [''],
      volumen: [''],
      volumenEuro: [''],
      jahresuebertrag: [false],
      rollenbezRahmenvertrag: [''],
      anmerkung: [''],
    });
    this.positionDetailForm.disable();
  }

  private initVerbraucherDetailForm(): void {
    this.verbraucherDetailForm = this.fb.group({
      aktiv: [false],
      verbraucherTyp: [''],
      person: [''],
      stundensatz: [''],
      StundensatzAnderung:[''],
      stundenkontingent: [''],
      volumenEuro: [''],
      anmerkung: ['']
    });
    this.verbraucherDetailForm.disable();
  }

private initChildDetailForm(): void {
  this.childDetailForm = this.fb.group({
    produkt: [null],
    produktposition: [null],
    stundenGeplant: [''],
    anmerkung: [''],
    aktiv: [false],
  });
  this.childDetailForm.disable();
}

 private loadVertragData(): void {
  this.loading = true;

  this.dummyService.getVertrag(this.vertragId, true).subscribe({
    next: (detailData: any) => {
      if (!detailData) {
        this.loading = false;
        return;
      }

      this.extractVertragTypenAndPositionTypen(detailData);

      if (detailData.vertragsverantwortlicher) {
        const v = detailData.vertragsverantwortlicher;
        this.verantwortlicherOptions = [{
          id: v.id,
          fullName: `${v.vorname || ''} ${v.nachname || ''}`.trim()
        }];
      }

      this.vertragForm.patchValue({
        vertragsname:    detailData.vertragsname    || '',
        vertragszusatz:  detailData.vertragszusatz  || '',
        vertragspartner: detailData.vertragspartner || '',
        auftraggeber:    detailData.auftraggeber    || '',
        vertragsverantwortlicher: detailData.vertragsverantwortlicher?.id || '',
        bezugsart:this.mapBezugsart(detailData.bezugsart),
        elak: detailData.elak|| '',
        beschaffungsnummer: detailData.beschaffungsnummer || '',
        lkVertrag: detailData.lkKennung || false,
        aktiv:  detailData.aktiv || false,
        erstellungsdatum: detailData.erstelldatum ? new Date(detailData.erstelldatum) : null,
        start:detailData.gueltigVon   ? new Date(detailData.gueltigVon)   : null,
        ende:detailData.gueltigBis   ? new Date(detailData.gueltigBis)   : null,
        vertragssumme:detailData.vertragssumme    || '',
        auftragsreferenz: detailData.auftragsreferenz || '',
        rahmenvertragGZ: detailData.geschaeftszahl || '',
        vertragstype: this.mapVertragsTyp(detailData.vertragsTyp),
        anmerkung: detailData.anmerkung || ''
      });

      this.originalVertragData = JSON.parse(JSON.stringify(this.vertragForm.value));

      // Build the tree
      if (detailData.vertragPosition) {
        this.vertragspositionen = detailData.vertragPosition.map((parentPos: any) => ({
          id:           parentPos.id,
          name:         parentPos.position || 'Unnamed Position',
          aktiv:        parentPos.aktiv !== false,
          typ:          'Vertragsposition',
          isExpanded:   false,
          level:        1,
          volumenEuro:  parentPos.volumenEuro,
          volumenStunden: parentPos.volumenStunden,
          stundenGeplant: parentPos.stundenGeplant,
          anmerkung:    parentPos.anmerkung || '',

          // FIX: these 3 were never mapped before
          planungsjahr: parentPos.planungsjahr           || '',
          jahresuebertrag: parentPos.jahresuebertrag        || false,
          rollenbezRahmenvertrag: parentPos.rollenbezeichnungRahmenvertrag || '',

          children: parentPos.vertragPositionVerbraucher?.map((verbraucher: any, vIndex: number) => ({
            id:  verbraucher.id || `${parentPos.id}-v${vIndex}`,
            name: verbraucher.person
                            ? `${verbraucher.person.vorname} ${verbraucher.person.nachname}`
                            : verbraucher.verbraucherTyp || 'Unbekannter Verbraucher',
            typ: 'Verbraucher',
            level:2,
            parentId:parentPos.id,
            aktiv:verbraucher.aktiv !== false,
            volumenEuro:verbraucher.volumenEuro,
            volumenStunden: verbraucher.volumenStunden,
            stundenGeplant: verbraucher.stundenGeplant,
            verbraucherTyp:  this.mapVerbraucherTyp(verbraucher.verbraucherTyp),
            stundensatz: verbraucher.stundenpreis   || '',
            stundenkontingent: verbraucher.stundenGeplant || '',
            anmerkung: verbraucher.anmerkung      || '',
            children: verbraucher.stundenplanung?.map((plan: any, pIndex: number) => ({
              id: plan.id || `${verbraucher.id}-p${pIndex}`,
              name:plan.produktPosition?.produkt?.produktname || `Plan ${pIndex + 1}`,
              aktiv:plan.produktPosition?.aktiv !== false,
              typ:'Buchungspunkt',
              level: 3,
              parentId:verbraucher.id,
              stundenGeplant: plan.stundenGeplant,
              anmerkung:plan.produktPosition?.anmerkung || '',
              produktPosition: plan.produktPosition
            })) || []
          })) || []
        }));
      }

      this.loading = false;
    },
    error: (error: any) => {
      console.error('Error:', error);
      this.loading = false;
    }
  });
}

private mapBezugsart(value: string): string {
  const map: { [key: string]: string } = {
    'BBG_ABRUF':         'BBG-Abruf',
    'BRZ_ABRUF':         'BRZ-Abruf',
    'DIREKTVERGABE':     'Direktvergabe',
    'BMI_AUSSCHREIBUNG': 'BMI-Ausschreibung'
  };
  return map[value] || value || '';
}

private mapVertragsTyp(value: string): string {
  const map: { [key: string]: string } = {
    'BETRIEB': 'Betrieb',
    'PROJEKT':  'Projekt'
  };
  return map[value] || value || '';
}

private mapVerbraucherTyp(value: string): string {
  const map: { [key: string]: string } = {
    'PERSONAL':  'Personal',
    'SACHMITTEL': 'Sachmittel'
  };
  return map[value] || value || '';
}
private extractVertragTypenAndPositionTypen(detailData: any): void {
  const vertragTypenSet = new Set<any>();
  const vertragPositionTypenSet = new Set<any>();

  if (detailData.vertragPosition) {
    detailData.vertragPosition.forEach((position: any) => {
      if (position.vertragPositionVerbraucher) {
        position.vertragPositionVerbraucher.forEach((verbraucher: any) => {
          if (verbraucher.stundenplanung) {
            verbraucher.stundenplanung.forEach((plan: any) => {
              if (plan.produktPosition) {

                vertragPositionTypenSet.add({
                  id: plan.produktPosition.id,
                  produktPositionname: plan.produktPosition.produktPositionname || 'Unnamed Position'
                });

                if (plan.produktPosition.produkt) {
                  vertragTypenSet.add({
                    id: plan.produktPosition.produkt.id,
                    produktname: plan.produktPosition.produkt.produktname || 'Unnamed Product'
                  });
                }
              }
            });
          }
        });
      }
    });
  }


  this.vertragList = Array.from(vertragTypenSet);
  this.vertragPositionTypenList = Array.from(vertragPositionTypenSet);

  console.log('Extracted Verträge:', this.vertragList);
  console.log('Extracted Vertragspositionen:', this.vertragPositionTypenList);
}

  // Main Form Actions (Vertrag)
onEditOrSubmit(): void {
  if (!this.isFormEditable) {
    this.isFormEditable = true;
    this.vertragForm.enable();
this.loadVerantwortlicherOptions();
    // Load full persons list for the dropdown when editing
    this.dummyService.getPersonen1().subscribe({
      next: (persons: any[]) => {
        this.verantwortlicherOptions = persons.map(p => ({
          id: p.id,
          fullName: `${p.vorname || ''} ${p.nachname || ''}`.trim()
        }));
      }
    });
  } else {
    this.onSubmit();
  }
}
onSubmit(): void {
  if (this.vertragForm.invalid) {
    this.snackBar.open('Bitte füllen Sie alle Pflichtfelder aus.', 'Schließen', {
      duration: 3000, verticalPosition: 'top',
    });
    return;
  }

  this.saving = true;
  const formValues = this.vertragForm.getRawValue();
  const isNewVertrag = !this.vertragId;

  // Build the DTO
  const dto = new ApiVertrag();
  dto.id = this.vertragId;
  dto.vertragsname = formValues.vertragsname;
  dto.vertragspartner = formValues.vertragspartner;
  dto.auftraggeber = formValues.auftraggeber;
  dto.vertragszusatz = formValues.vertragszusatz;
  dto.auftragsreferenz = formValues.auftragsreferenz;
  dto.elak = formValues.elak;
  dto.beschaffungsnummer = formValues.beschaffungsnummer;
  dto.anmerkung = formValues.anmerkung;
  dto.vertragssumme = formValues.vertragssumme?.toString();
  dto.aktiv = formValues.aktiv;
  dto.lkKennung = formValues.lkVertrag;
  dto.bezugsart = formValues.bezugsart;
  dto.vertragsTyp = formValues.vertragsType;
  dto.geschaeftszahl = formValues.rahmenvertragGZ;
  dto.vertragsverantwortlicher = { id: formValues.vertragsverantwortlicher } as ApiPerson;

  if (formValues.erstellungsdatum) {
    dto.erstelldatum = formValues.erstellungsdatum.toISOString();
  }
  if (formValues.start) {
    dto.gueltigVon = formValues.start.toISOString();
  }
  if (formValues.ende) {
    dto.gueltigBis = formValues.ende.toISOString();
  }

  const saveObservable = isNewVertrag
    ? this.dummyService.createVertrag(dto)
    : this.dummyService.updateVertrag(this.vertragId, dto);

  saveObservable.subscribe({
    next: (response: ApiVertrag) => {
      this.vertragId = response.id ?? this.vertragId;
      this.originalVertragData = JSON.parse(JSON.stringify(this.vertragForm.value));
      this.saving = false;
      this.isFormEditable = false;
      this.vertragForm.disable();

      if (isNewVertrag && response.id) {
        window.history.replaceState({}, '', `/vertrag/${response.id}`);
      }

      this.snackBar.open('Daten wurden erfolgreich gespeichert', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top',
      });
    },
    error: (error: string) => {
      this.saving = false;
      this.snackBar.open('Fehler beim Speichern des Vertrags.', 'Schließen', { duration: 4000 });
    }
  });
}

  onCancel(): void {
  if (this.isFormEditable) {
    if (!this.vertragId) {
      this.router.navigate(['/vertrag']);
      return;
    }
    this.isFormEditable = false;
    this.vertragForm.patchValue(this.originalVertragData);
    this.vertragForm.disable();
  } else {
    this.router.navigate(['/vertrag']);
  }
}
selectPosition(position: any): void {
  if (this.selectedPosition?.id === position.id && !position.isNew) {
    position.isExpanded = !position.isExpanded;
    return;
  }

  if (this.isNewPositionBeingCreated || this.isNewVerbraucherBeingCreated || this.isNewChildBeingCreated) {
    if (this.selectedPosition && this.selectedPosition.id === position.id && this.selectedPosition.isNew) {
        return;
    }
      this.discardNewPosition(false);
  this.doSelectPosition(position);

    return;
  }

  this.doSelectPosition(position);
}

private doSelectPosition(position: any): void {
  const previousSelection = this.selectedPosition;
  this.selectedPosition = position;
  this.isPositionFormEditable = false;
  this.isVerbraucherFormEditable = false;
  this.isChildFormEditable = false;
  this.editingNewNodeParentId = null;

  if (previousSelection && !this.isParentOfSelected(previousSelection, position)) {
    previousSelection.isExpanded = false;
  }

  if (position.isNew) {
    if (position.typ === 'Vertragsposition') {
      this.isPositionFormEditable = true;
      this.positionDetailForm.enable();
      this.isNewPositionBeingCreated = true;
    } else if (position.typ === 'Verbraucher') {
      this.isVerbraucherFormEditable = true;
      this.verbraucherDetailForm.enable();
      this.isNewVerbraucherBeingCreated = true;
    } else if (position.typ === 'Buchungspunkt' || position.typ === 'Dokumentation') {
      this.isChildFormEditable = true;
      this.childDetailForm.enable();
      this.isNewChildBeingCreated = true;
    }
  }

  if (position.typ === 'Vertragsposition') {
   this.positionDetailForm.patchValue({
  aktiv:position.aktiv|| false,
  positionsbezeichnung:position.name|| '',
  planungsjahr:  position.planungsjahr || '',
  volumen:  position.volumenStunden || '',
  volumenEuro: position.volumenEuro || '',
  jahresuebertrag:position.jahresuebertrag|| false,
  rollenbezRahmenvertrag: position.rollenbezRahmenvertrag || '',
  anmerkung: position.anmerkung || '',
});
    if (!this.isPositionFormEditable) this.positionDetailForm.disable();
  } else if (position.typ === 'Verbraucher') {
  this.verbraucherDetailForm.patchValue({
    aktiv:position.aktiv|| false,
    verbraucherTyp:position.verbraucherTyp || '',
    person:position.name|| '',
    stundensatz:position.stundensatz || '',
    stundenkontingent: position.stundenkontingent|| '',
    volumenEuro:position.volumenEuro|| '',
    anmerkung:position.anmerkung|| '',
    StundensatzAnderung: position.stundensatzAenderung || ''
  });
    if (!this.isVerbraucherFormEditable) this.verbraucherDetailForm.disable();
  } else if (position.typ === 'Buchungspunkt' || position.typ === 'Dokumentation') {
    this.childDetailForm.patchValue({
      produkt: position.produktPosition?.produkt?.id || null,
      produktposition: position.produktPosition?.id || null,
      stundenGeplant: position.stundenGeplant || '',
      anmerkung: position.anmerkung || '',
      aktiv: position.aktiv || false
    });
    if (!this.isChildFormEditable) this.childDetailForm.disable();
  }
}

private isParentOfSelected(possibleParent: any, selectedNode: any): boolean {
  if (!possibleParent.children || possibleParent.children.length === 0) {
    return false;
  }


  for (const child of possibleParent.children) {
    if (child.id === selectedNode.id) {
      return true;
    }
  }

  for (const child of possibleParent.children) {
    if (child.children && this.isParentOfSelected(child, selectedNode)) {
      return true;
    }
  }

  return false;
}
  onEditOrSubmitPositionOrChild(): void {
    if (!this.selectedPosition) return;

    if (this.selectedPosition.typ === 'Vertragsposition') {
      if (!this.isPositionFormEditable) {
        this.isPositionFormEditable = true;
        this.positionDetailForm.enable();
      } else {
        this.savePositionDetails();
      }
    }
    else if (this.selectedPosition.typ === 'Verbraucher') {
      if (!this.isVerbraucherFormEditable) {
        this.isVerbraucherFormEditable = true;
        this.verbraucherDetailForm.enable();
      } else {
        this.saveVerbraucherDetails();
      }
    }
    else {
      if (!this.isChildFormEditable) {
        this.isChildFormEditable = true;
        this.childDetailForm.enable();
      } else {
        this.saveChildDetails();
      }
    }
  }

 onCancelPositionOrChild(): void {
  if (!this.selectedPosition) return;

  if (this.selectedPosition.isNew) {
    const parentIdToReSelect = this.editingNewNodeParentId;
    this.discardNewPosition(true);
    if (parentIdToReSelect) {
      const parentNode = this.findNodeById(this.vertragspositionen, parentIdToReSelect);
      if (parentNode) {
        this.selectPosition(parentNode);
      }
    }
  } else {
    if (this.selectedPosition.typ === 'Vertragsposition') {
      this.cancelPositionDetails();
    } else if (this.selectedPosition.typ === 'Verbraucher') {
      this.cancelVerbraucherDetails();
    } else {
      this.cancelChildDetails();
    }
  }
}

openConfirmDeleteNewDialog(): void {
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '350px',
    data: {
      title: `Neue ${this.selectedPosition.typ} verwerfen?`,
      message: `Wollen Sie die neu erstellte ${this.selectedPosition.typ} "${this.selectedPosition.name}" wirklich verwerfen? Alle ungespeicherten Änderungen gehen verloren.`,
    },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.discardNewPosition();
    }
  });
}

private savePositionDetails(): void {
    if (!this.selectedPosition || this.positionDetailForm.invalid) return;

    const formValues = this.positionDetailForm.getRawValue();

    const dto = new ApiVertragPosition();
    dto.position = formValues.positionsbezeichnung;
    dto.volumenStunden = formValues.volumen?.toString();
    dto.volumenEuro = formValues.volumenEuro?.toString();
    dto.anmerkung = formValues.anmerkung;
    dto.aktiv = formValues.aktiv;
    dto.planungsjahr = formValues.planungsjahr;
    dto.jahresuebertrag = formValues.jahresuebertrag;
    dto.rollenbezeichnungRahmenvertrag = formValues.rollenbezRahmenvertrag;
    debugger
    if (this.selectedPosition.isPendingCreation) {
      this.dummyService.createVertragPosition(dto, this.vertragId).subscribe({

        next: (response: ApiVertragPosition) => {
          const newPosition = {
            ...this.selectedPosition,
            ...formValues,
            id: response.id || this.selectedPosition.id,
            name: formValues.positionsbezeichnung,
            isPendingCreation: false,
            isNew: false
          };
          this.vertragspositionen.unshift(newPosition);
          this.finalizePositionSave();
        },
        error: (err: any) => {
          this.snackBar.open('Fehler beim Erstellen der Position.', 'Schließen', { duration: 4000 });
        }
      });
    } else {
      dto.id = this.selectedPosition.id;

      this.dummyService.updateVertragPosition(this.selectedPosition.id, dto).subscribe({
        next: (response: ApiVertragPosition) => {
          const updateInArray = (arr: any[], id: string | number, data: any) => {
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].id === id) {
                arr[i] = { ...arr[i], ...data };
                this.selectedPosition = arr[i];
                return true;
              }
              if (arr[i].children && updateInArray(arr[i].children!, id, data)) return true;
            }
            return false;
          };

          updateInArray(this.vertragspositionen, this.selectedPosition.id, {
            ...formValues,
            name: formValues.positionsbezeichnung
          });
          this.finalizePositionSave();
        },
        error: (err: string) => {
          this.snackBar.open('Fehler beim Speichern der Position.', 'Schließen', { duration: 4000 });
        }
      });
    }
  }

  private finalizePositionSave(): void {
    this.isPositionFormEditable = false;
    this.positionDetailForm.disable();
    this.isNewPositionBeingCreated = false;
    if (this.selectedPosition && this.selectedPosition.isNew) {
      this.selectedPosition.isNew = false;
    }
    this.snackBar.open('Position erfolgreich gespeichert', 'Schließen', { duration: 3000 });
  }

  private cancelPositionDetails(): void {
    if (!this.selectedPosition) return;

    this.isPositionFormEditable = false;
    this.positionDetailForm.patchValue({
      aktiv: this.selectedPosition?.aktiv ?? false,
      positionsbezeichnung: this.selectedPosition?.name ?? '',
      planungsjahr: this.selectedPosition?.planungsjahr ?? '',
      volumen: this.selectedPosition?.volumen ?? '',
      volumenEuro: this.selectedPosition?.volumenEuro ?? '',
      jahresuebertrag: this.selectedPosition?.jahresuebertrag ?? false,
      rollenbezRahmenvertrag: this.selectedPosition?.rollenbezRahmenvertrag ?? '',
      anmerkung: this.selectedPosition?.anmerkung ?? '',
    });
    this.positionDetailForm.disable();
  }

 private saveVerbraucherDetails(): void {
  debugger
  if (!this.selectedPosition) return;

  const formValues = this.verbraucherDetailForm.getRawValue();

  const dto = new ApiVertragPositionVerbraucher();
  dto.aktiv = formValues.aktiv;
  dto.verbraucher = formValues.person;
  dto.stundenpreis = formValues.stundensatz?.toString();
  dto.stundenGeplant = formValues.stundenkontingent?.toString();
  dto.volumenEuro = formValues.volumenEuro?.toString();
  dto.anmerkung = formValues.anmerkung;
  dto.verbraucherTyp = formValues.verbraucherTyp


  if (this.selectedPosition.isPendingCreation && this.editingNewNodeParentId) {
    this.dummyService
      .createVertragPositionVerbraucher(dto, this.editingNewNodeParentId)
      .subscribe({
        next: (response: ApiVertragPositionVerbraucher) => {
          const parentNode = this.findNodeById(
            this.vertragspositionen,
            this.editingNewNodeParentId!
          );
          if (parentNode) {
            if (!parentNode.children) parentNode.children = [];
            parentNode.children.push({
              ...this.selectedPosition,
              ...formValues,
              id: response.id,
              name: formValues.person,
              isPendingCreation: false,
              isNew: false,
            });
            parentNode.isExpanded = true;
          }
          this.finalizeVerbraucherSave();
        },
        error: () => {
          this.snackBar.open('Fehler beim Erstellen des Verbrauchers.', 'Schließen', {
            duration: 4000,
          });
        },
      });
  } else {
    dto.id = this.selectedPosition.id;

    this.dummyService
      .updateVertragPositionVerbraucher(this.selectedPosition.id, dto)
      .subscribe({
        next: (response: ApiVertragPositionVerbraucher) => {
          const updateInArray = (arr: any[], id: string | number, data: any): boolean => {
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].id === id) {
                arr[i] = { ...arr[i], ...data };
                this.selectedPosition = arr[i];
                return true;
              }
              if (arr[i].children && updateInArray(arr[i].children, id, data)) return true;
            }
            return false;
          };

          updateInArray(this.vertragspositionen, this.selectedPosition.id, {
            ...formValues,
            name: formValues.person,
          });
          this.finalizeVerbraucherSave();
        },
        error: () => {
          this.snackBar.open('Fehler beim Speichern des Verbrauchers.', 'Schließen', {
            duration: 4000,
          });
        },
      });
  }
}

private finalizeVerbraucherSave(): void {
  this.isVerbraucherFormEditable = false;
  this.verbraucherDetailForm.disable();
  this.isNewVerbraucherBeingCreated = false;
  if (this.selectedPosition) this.selectedPosition.isNew = false;
  this.snackBar.open('Verbraucher erfolgreich gespeichert', 'Schließen', { duration: 3000 });
}

  private cancelVerbraucherDetails(): void {
    if (!this.selectedPosition) return;

    this.isVerbraucherFormEditable = false;
    this.verbraucherDetailForm.patchValue({
      aktiv: this.selectedPosition?.aktiv ?? false,
      verbraucherTyp: this.selectedPosition?.verbraucherTyp ?? '',
      person: this.selectedPosition?.name ?? '',
      stundensatz: this.selectedPosition?.stundensatz ?? '',
      stundenkontingent: this.selectedPosition?.stundenkontingent ?? '',
      volumenEuro: this.selectedPosition?.volumenEuro ?? '',
      anmerkung: this.selectedPosition?.anmerkung ?? ''
    });
    this.verbraucherDetailForm.disable();
  }

 private saveChildDetails(): void {
  debugger
  if (!this.selectedPosition || this.childDetailForm.invalid) return;

  const formValues = this.childDetailForm.getRawValue();
  const dto = new ApiStundenplanung();
  dto.stundenGeplant = formValues.stundenGeplant?.toString();
  dto.anmerkung = formValues.anmerkung;
dto.produkt = { id: formValues.produkt } as ApiProdukt;
dto.produktPosition = { id: formValues.produktposition } as ApiProduktPosition;
  if (this.selectedPosition.isPendingCreation && this.editingNewNodeParentId) {
    const produktPositionId: string = formValues.produktposition ?? '';

    this.dummyService
      .createStundenplanung(dto, produktPositionId, this.editingNewNodeParentId)
      .subscribe({
        next: (response: ApiStundenplanung) => {
          const parentNode = this.findNodeById(
            this.vertragspositionen,
            this.editingNewNodeParentId!
          );
          if (parentNode) {
            if (!parentNode.children) parentNode.children = [];
            parentNode.children.push({
              ...this.selectedPosition,
              ...formValues,
              id: response.id,
              name: formValues.anmerkung || this.selectedPosition.name,
              isPendingCreation: false,
              isNew: false,
            });
            parentNode.isExpanded = true;
          }
          this.finalizeChildSave();
        },
        error: () => {
          this.snackBar.open('Fehler beim Erstellen des Buchungspunkts.', 'Schließen', {
            duration: 4000,
          });
        },
      });
  } else {
    // UPDATE
    dto.id = this.selectedPosition.id;

    this.dummyService
      .updateStundenplanung(this.selectedPosition.id, dto)
      .subscribe({
        next: () => {
          const updateInArray = (arr: any[], id: string | number, data: any): boolean => {
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].id === id) {
                arr[i] = { ...arr[i], ...data };
                this.selectedPosition = arr[i];
                return true;
              }
              if (arr[i].children && updateInArray(arr[i].children, id, data)) return true;
            }
            return false;
          };

          updateInArray(this.vertragspositionen, this.selectedPosition.id, {
            ...formValues,
            name: formValues.anmerkung || this.selectedPosition.name,
          });
          this.finalizeChildSave();
        },
        error: () => {
          this.snackBar.open('Fehler beim Speichern des Buchungspunkts.', 'Schließen', {
            duration: 4000,
          });
        },
      });
  }
}

private finalizeChildSave(): void {
  this.isChildFormEditable = false;
  this.childDetailForm.disable();
  this.isNewChildBeingCreated = false;
  if (this.selectedPosition) this.selectedPosition.isNew = false;
  this.snackBar.open('Buchungspunkt erfolgreich gespeichert', 'Schließen', { duration: 3000 });
}


 private cancelChildDetails(): void {
  if (!this.selectedPosition) return;

  this.isChildFormEditable = false;
  this.childDetailForm.patchValue({
    produkt: this.selectedPosition.produktPosition?.produkt?.id || null,
    produktposition: this.selectedPosition.produktPosition?.id || null,
    stundenGeplant: this.selectedPosition.stundenGeplant || '',
    anmerkung: this.selectedPosition.anmerkung || '',
    aktiv: this.selectedPosition.aktiv || false
  });
  this.childDetailForm.disable();
}
  openDeleteDialog(): void {
    if (!this.selectedPosition) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: `Löschen eines ${this.selectedPosition.typ}`,
        message: `Wollen Sie den ${this.selectedPosition.typ} "${this.selectedPosition.name}" wirklich löschen?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteSelectedPosition();
      }
    });
  }

private deleteSelectedPosition(): void {
  if (!this.selectedPosition) return;

  const id = this.selectedPosition.id;
  const typ = this.selectedPosition.typ;

  const removeFromArray = (arr: any[], targetId: string | number): any[] => {
    return arr.filter(item => {
      if (item.id === targetId) return false;
      if (item.children) {
        item.children = removeFromArray(item.children, targetId);
      }
      return true;
    });
  };

  if (typ === 'Vertragsposition') {
    const dto = new ApiVertragPosition();
    dto.id = id;
    dto.position = this.selectedPosition.name;
    dto.aktiv = false;

    this.dummyService.updateVertragPosition(id, dto).subscribe({
      next: () => {
        this.vertragspositionen = removeFromArray(this.vertragspositionen, id);
        this.resetFormsAfterDelete();
        this.snackBar.open('Position erfolgreich gelöscht', 'Schließen', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Fehler beim Löschen.', 'Schließen', { duration: 4000 });
      }
    });

  } else if (typ === 'Verbraucher') {
    const dto = new ApiVertragPositionVerbraucher();
    dto.id = id;
    dto.aktiv = false;

    this.dummyService.updateVertragPositionVerbraucher(id, dto).subscribe({
      next: () => {
        this.vertragspositionen = removeFromArray(this.vertragspositionen, id);
        this.resetFormsAfterDelete();
        this.snackBar.open('Verbraucher erfolgreich gelöscht', 'Schließen', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Fehler beim Löschen des Verbrauchers.', 'Schließen', { duration: 4000 });
      }
    });

  } else if (typ === 'Buchungspunkt') {
    const dto = new ApiStundenplanung();
    dto.id = id;

    this.dummyService.updateStundenplanung(id, dto).subscribe({
      next: () => {
        this.vertragspositionen = removeFromArray(this.vertragspositionen, id);
        this.resetFormsAfterDelete();
        this.snackBar.open('Buchungspunkt erfolgreich gelöscht', 'Schließen', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Fehler beim Löschen des Buchungspunkts.', 'Schließen', { duration: 4000 });
      }
    });
  }
}
  private resetFormsAfterDelete(): void {
    this.selectedPosition = null;
    this.positionDetailForm.reset();
    this.positionDetailForm.disable();
    this.isPositionFormEditable = false;
    this.verbraucherDetailForm.reset();
    this.verbraucherDetailForm.disable();
    this.isVerbraucherFormEditable = false;
    this.childDetailForm.reset();
    this.childDetailForm.disable();
    this.isChildFormEditable = false;
  }
private findNodeById(nodes: any[], id: string | number): any | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const foundChild = this.findNodeById(node.children, id);
      if (foundChild) {
        return foundChild;
      }
    }
  }
  return null;
}

private cancelAndResetNewFlags(): boolean {
  if (this.isNewPositionBeingCreated || this.isNewVerbraucherBeingCreated || this.isNewChildBeingCreated) {
    if (this.selectedPosition && this.selectedPosition.isNew) {
      this.discardNewPosition(false);
    }
    return true;
  }
  return false;
}
private discardNewPosition(showSnackBar: boolean = true): void {
  if (!this.selectedPosition || !this.selectedPosition.isNew) return;

  const removeFromArray = (arr: any[], id: string | number): any[] => {
    return arr.filter(item => {
      if (item.id === id) {
        return false;
      }
      if (item.children) {
        item.children = removeFromArray(item.children, id);
      }
      return true;
    });
  };

  const discardedLevel = this.selectedPosition.level;
  const discardedParentId = this.editingNewNodeParentId;

  if (discardedLevel === 1) {
    this.vertragspositionen = removeFromArray(this.vertragspositionen, this.selectedPosition.id);
    this.isNewPositionBeingCreated = false;
  } else if (discardedLevel === 2) {
    this.vertragspositionen.forEach(pos => {
      if (pos.children) {
        pos.children = removeFromArray(pos.children, this.selectedPosition.id);
      }
    });
    this.isNewVerbraucherBeingCreated = false;
  } else if (discardedLevel === 3) {
    this.vertragspositionen.forEach(pos => {
      if (pos.children) {
        pos.children.forEach((verbraucher:any) => {
          if (verbraucher.children) {
            verbraucher.children = removeFromArray(verbraucher.children, this.selectedPosition.id);
          }
        });
      }
    });
    this.isNewChildBeingCreated = false;
  }

  this.selectedPosition = null;
  this.positionDetailForm.reset();
  this.positionDetailForm.disable();
  this.isPositionFormEditable = false;
  this.verbraucherDetailForm.reset();
  this.verbraucherDetailForm.disable();
  this.isVerbraucherFormEditable = false;
  this.childDetailForm.reset();
  this.childDetailForm.disable();
  this.isChildFormEditable = false;
  this.editingNewNodeParentId = null;


  if (!showSnackBar && discardedParentId) {
    const parentNode = this.findNodeById(this.vertragspositionen, discardedParentId);
    if (parentNode) {
      this.selectPosition(parentNode);
    }
  }
}

  toggleMenu(): void {
  }
  isEditing: boolean = false;
previousValue: string = '';

onEditStundensatz(): void {
  this.isEditing = true;
  this.previousValue = this.verbraucherDetailForm.get('anmerkung')?.value || '';
}

onSaveStundensatz(): void {
  this.isEditing = false;
  const newValue = this.verbraucherDetailForm.get('anmerkung')?.value;
}

onCancelStundensatz(): void {
  this.isEditing = false;
  this.verbraucherDetailForm.patchValue({
    anmerkung: this.previousValue
  });
}

goToPersonPage(): void {
  this.router.navigate(['/personen'])

}

}
