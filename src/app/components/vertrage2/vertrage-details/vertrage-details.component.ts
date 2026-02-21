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
import { VertrageService } from '../../../services/vertrage.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FlatNode } from '../../../models/Flat-node';
import { TaetigkeitNode } from '../../../models/TaetigkeitNode';

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
  verantwortlicherOptions: string[] = [];
  servicemanagerOptions: string[] = [];
    vertragList: any[] = [];
  vertragPositionTypenList: any[] = [];
isNewPositionBeingCreated = false;
isNewVerbraucherBeingCreated = false;
isNewChildBeingCreated = false;
 editingNewNodeParentId: string | null = null;
 vertragId!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public dialog: MatDialog,
     private vertrageService: VertrageService
  ) {}



  ngOnInit(): void {
      this.vertragId = this.route.snapshot.paramMap.get('id')!;
    this.initMainForm();
    this.initPositionDetailForm();
    this.initVerbraucherDetailForm();
    this.initChildDetailForm();
    this.loadVertragData();
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
  return node && node.level === 1; // Always allow adding, as old will be discarded
}

canAddBuchungspunkt(node: FlatNode): boolean {
  return node && node.level === 2; // Always allow adding, as old will be discarded
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
    isPendingCreation: true // New flag to track pending creation
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
  ////array for drop down//
  bezugsartenArray=['Bezugsart wählen','Dezentrale Beschaffung','Zentrale Beschaffung'];
  vertragsArray=['Vertragstyp wählen','Dienstleistung','Warenlieferung','Werkvertrag']
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

this.vertrageService.getOneVertrage(this.vertragId).subscribe({
    next: (detailData:any) => {
      console.log('Loaded JSON data:', detailData);

      if (!detailData) {
        this.snackBar.open('Vertrag nicht gefunden', 'Schließen', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.loading = false;
        return;
      }
      // Extract products and product positions from the JSON data
      this.extractVertragTypenAndPositionTypen(detailData);

      this.vertragForm.patchValue({
        vertragsname: detailData.vertragsname || '',
        vertragszusatz: detailData.vertragszusatz || '',
        vertragspartner: detailData.vertragspartner || '',
        auftraggeber: detailData.auftraggeber || '',
        vertragsverantwortlicher: '',
        bezugsart: '',
        elak: detailData.elak || '',
        beschaffungsnummer: detailData.beschaffungsnummer || '',
        lkVertrag: false,
        aktiv: detailData.aktiv || false,
        erstellungsdatum: detailData.erstelldatum ? new Date(detailData.erstelldatum) : null,
        start: detailData.gueltigVon ? new Date(detailData.gueltigVon) : null,
        ende: detailData.gueltigBis ? new Date(detailData.gueltigBis) : null,
        vertragssumme: detailData.vertragssumme || '',
        auftragsreferenz: detailData.auftragsreferenz || '',
        rahmenvertragGZ: '',
        vertragstype: detailData.vertragstype || '',
        anmerkung: detailData.anmerkung || ''
      });

      this.originalVertragData = JSON.parse(JSON.stringify(this.vertragForm.value));

      const allVerantwortlicher: string[] = [];
      const allServicemanager: string[] = [];


      if (detailData.vertragPosition) {
        detailData.vertragPosition.forEach((pos: any) => {

          if (pos.vertragPositionVerbraucher) {
            pos.vertragPositionVerbraucher.forEach((verbraucher: any) => {
              if (verbraucher.person) {
                const fullName =
                  (verbraucher.person.vorname || '') + ' ' +
                  (verbraucher.person.nachname || '');
                if (fullName.trim()) allVerantwortlicher.push(fullName);
              }
            });
          }


            if (pos.stundenplanung) {
            pos.stundenplanung.forEach((plan: any) => {
              if (plan.produktPosition && plan.produktPosition.auftraggeberOrganisation) {
                allServicemanager.push(plan.produktPosition.auftraggeberOrganisation);
              }
            });
          }
        });

        this.verantwortlicherOptions = [...new Set(allVerantwortlicher)];
        this.servicemanagerOptions = [...new Set(allServicemanager)];

this.vertragspositionen = detailData.vertragPosition.map((parentPos: any) => {
  return {
    id: parentPos.id,
    name: parentPos.position || 'Unnamed Position',
    start: parentPos.start ? new Date(parentPos.start) : undefined,
    ende: parentPos.ende ? new Date(parentPos.ende) : undefined,
    status: parentPos.aktiv !== false ? 'active' : 'inactive',
    aktiv: parentPos.aktiv !== false,
    typ:'Vertragsposition',
    isExpanded: false,
    level: 1,
    auftraggeber: '',
    organisationseinheit: '',
    durchfuehrungsverantwortlicher: '',
    positionstyp: '',
    buchungsfreigabe: parentPos.buchungsfreigabe || false,
    anmerkung: parentPos.anmerkung,
    servicemanager: '',

    volumenEuro: parentPos.volumenEuro,
    volumenStunden: parentPos.volumenStunden,
    stundenGeplant: parentPos.stundenGeplant,

  children: parentPos.vertragPositionVerbraucher?.map((verbraucher: any, vIndex: number) => ({
  id: verbraucher.id || `${parentPos.id}-v${vIndex}`,
  name: verbraucher.person
    ? `${verbraucher.person.vorname} ${verbraucher.person.nachname}`
    : verbraucher.verbraucherTyp || 'Unbekannter Verbraucher',
  typ: 'Verbraucher',
  level: 2,
  parentId: parentPos.id,
  volumenEuro: verbraucher.volumenEuro,
  volumenStunden: verbraucher.volumenStunden,
  stundenGeplant: verbraucher.stundenGeplant,
  aktiv: verbraucher.aktiv !== false,

     children: verbraucher.stundenplanung?.map((plan: any, pIndex: number) => ({
  id: plan.id || `${verbraucher.id}-p${pIndex}`,
  name: plan.produktPosition?.produkt?.produktname || `Plan ${pIndex + 1}`,
  aktiv: plan.produktPosition?.aktiv !== false,
  status: plan.produktPosition?.aktiv !== false ? 'active' : 'inactive',
  typ: 'Buchungspunkt',
  level: 3,
        parentId: verbraucher.id,
        start: plan.produktPosition?.start ? new Date(plan.produktPosition.start) : undefined,
        ende: plan.produktPosition?.ende ? new Date(plan.produktPosition.ende) : undefined,
        auftraggeber: plan.produktPosition?.auftraggeber,
        organisationseinheit: plan.produktPosition?.auftraggeberOrganisation,
        durchfuehrungsverantwortlicher: '',
        positionstyp: plan.produktPosition?.produktPositionTyp,
        buchungsfreigabe: plan.produktPosition?.buchungsfreigabe,
        anmerkung: plan.produktPosition?.anmerkung,
        stundenGeplant: plan.stundenGeplant,


        produktPosition: plan.produktPosition
      })) || []
    })) || []
  };
});


this.vertragspositionen.forEach((level1Item, index) => {
  console.log(`Level 1 [${index}]:`, level1Item);
  if (level1Item.children) {
    level1Item.children.forEach((level2Item:any, childIndex:number) => {
      console.log(`  Level 2 [${childIndex}]:`, level2Item);
      if (level2Item.children) {
        level2Item.children.forEach((level3Item:any, grandChildIndex:number) => {
          console.log(`    Level 3 [${grandChildIndex}]:`, level3Item);
        });
      }
    });
  }
});
      }

      this.loading = false;
    },
    error: (error: any) => {
      console.error('Error loading JSON data:', error);
      this.snackBar.open('Fehler beim Laden der Vertragsdaten', 'Schließen', {
        duration: 8000,
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.loading = false;
    }
  });
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
    console.log('Form enabled with change detection');
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
    setTimeout(() => {
      console.log('Main Form Saved:', this.vertragForm.value);
      this.originalVertragData = JSON.parse(JSON.stringify(this.vertragForm.value));
      this.saving = false;
      this.isFormEditable = false;
      this.vertragForm.disable();
      this.snackBar.open('Daten wurden erfolgreich gespeichert', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top',
      });
    }, 1000);
  }

  onCancel(): void {
    if (this.isFormEditable) {
      this.isFormEditable = false;
      this.vertragForm.patchValue(this.originalVertragData);
      this.vertragForm.disable();
    } else {
      this.router.navigate(['/vertrag']);
    }
  }

  // Position Tree and Detail Actions
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

// Helper method to actually perform the selection, to be called after checks/dialogs
private doSelectPosition(position: any): void {
  const previousSelection = this.selectedPosition;
  this.selectedPosition = position;
  this.isPositionFormEditable = false;
  this.isVerbraucherFormEditable = false;
  this.isChildFormEditable = false;
  this.editingNewNodeParentId = null; // Clear parent tracking when selecting an existing node

  if (previousSelection && !this.isParentOfSelected(previousSelection, position)) {
    previousSelection.isExpanded = false;
  }

  // If the selected position is marked as new (e.g., just added via a button)
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

  // Patch values and disable forms if not in editable mode for an existing item
  if (position.typ === 'Vertragsposition') {
    this.positionDetailForm.patchValue({
      aktiv: position.aktiv || false,
      positionsbezeichnung: position.name || '',
      planungsjahr: position.planungsjahr || '',
      volumen: position.volumen || '',
      volumenEuro: position.volumenEuro || '',
      jahresuebertrag: position.jahresuebertrag || false,
      rollenbezRahmenvertrag: position.rollenbezRahmenvertrag || '',
      anmerkung: position.anmerkung || '',
    });
    if (!this.isPositionFormEditable) this.positionDetailForm.disable();
  } else if (position.typ === 'Verbraucher') {
    this.verbraucherDetailForm.patchValue({
      aktiv: position.aktiv || false,
      verbraucherTyp: position.verbraucherTyp || '',
      person: position.name || '',
      stundensatz: position.stundensatz || '',
      stundenkontingent: position.stundenkontingent || '',
      volumenEuro: position.volumenEuro || '',
      anmerkung: position.anmerkung || ''
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
  if (!this.selectedPosition) return;
  if (this.positionDetailForm.invalid) return;

  const updatedData = {
    ...this.positionDetailForm.getRawValue(),
    name: this.positionDetailForm.get('positionsbezeichnung')?.value,
    typ: this.selectedPosition.typ,
    id: this.selectedPosition.id
  };

  if (this.selectedPosition.isPendingCreation) {
    this.vertragspositionen.unshift({...this.selectedPosition, ...updatedData, isPendingCreation: false});
  } else {
    const updateInArray = (arr: any[], id: string | number, data: any) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
          arr[i] = { ...arr[i], ...data };
          this.selectedPosition = arr[i];
          return true;
        }
        if (arr[i].children && updateInArray(arr[i].children!, id, data)) {
          return true;
        }
      }
      return false;
    };
    updateInArray(this.vertragspositionen, this.selectedPosition.id, updatedData);
  }

  this.isPositionFormEditable = false;
  this.positionDetailForm.disable();
  this.isNewPositionBeingCreated = false;
  if (this.selectedPosition.isNew) {
    this.selectedPosition.isNew = false;
  }
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
  if (!this.selectedPosition) return;

  const updatedData = {
    ...this.verbraucherDetailForm.getRawValue(),
    name: this.verbraucherDetailForm.get('person')?.value,
    typ: this.selectedPosition.typ,
    id: this.selectedPosition.id
  };

  if (this.selectedPosition.isPendingCreation && this.editingNewNodeParentId) {
    const parentNode = this.findNodeById(this.vertragspositionen, this.editingNewNodeParentId);
    if (parentNode) {
      if (!parentNode.children) parentNode.children = [];
      parentNode.children.push({...this.selectedPosition, ...updatedData, isPendingCreation: false});
      parentNode.isExpanded = true;
    }
  } else {
    const updateInArray = (arr: any[], id: string | number, data: any) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
          arr[i] = { ...arr[i], ...data };
          this.selectedPosition = arr[i];
          return true;
        }
        if (arr[i].children && updateInArray(arr[i].children!, id, data)) {
          return true;
        }
      }
      return false;
    };
    updateInArray(this.vertragspositionen, this.selectedPosition.id, updatedData);
  }

  this.isVerbraucherFormEditable = false;
  this.verbraucherDetailForm.disable();
  this.isNewVerbraucherBeingCreated = false;
  this.selectedPosition.isNew = false;
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
  if (!this.selectedPosition) return;
  if (this.childDetailForm.invalid) return;

  const updatedData = {
    ...this.childDetailForm.getRawValue(),
    typ: this.selectedPosition.typ,
    id: this.selectedPosition.id,
    name: this.childDetailForm.get('anmerkung')?.value || this.selectedPosition.name
  };

  if (this.selectedPosition.isPendingCreation && this.editingNewNodeParentId) {
    const parentNode = this.findNodeById(this.vertragspositionen, this.editingNewNodeParentId);
    if (parentNode) {
      if (!parentNode.children) parentNode.children = [];
      parentNode.children.push({...this.selectedPosition, ...updatedData, isPendingCreation: false});
      parentNode.isExpanded = true;
    }
  } else {
    const updateInArray = (arr: any[], id: string | number, data: any) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
          arr[i] = { ...arr[i], ...data };
          this.selectedPosition = arr[i];
          return true;
        }
        if (arr[i].children && updateInArray(arr[i].children!, id, data)) {
          return true;
        }
      }
      return false;
    };
    updateInArray(this.vertragspositionen, this.selectedPosition.id, updatedData);
  }

  this.isChildFormEditable = false;
  this.childDetailForm.disable();
  this.isNewChildBeingCreated = false;
  this.selectedPosition.isNew = false;
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

    this.vertragspositionen = removeFromArray(this.vertragspositionen, this.selectedPosition.id);
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

// Inside VertragDetailsComponent class
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
