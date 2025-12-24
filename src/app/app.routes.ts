import { Routes } from '@angular/router';
import { TimeTrackingTableComponent } from './components/time-tracking-table/time-tracking-table.component';
import { AttendanceListComponent } from './components/attendance/attendance-list.component';
import { ActivityBookingComponent } from './components/activity-booking/activity-booking.component';
import { AnwesenheitslisteListComponent } from './components/anwesenheitsliste/anwesenheitsliste-list/anwesenheitsliste-list.component';
import { AbwesenheitListComponent } from './components/abwesenheit/abwesenheit-list/abwesenheit-list.component';
import { ProdukteComponent } from './components/produkte/produkte.component';
import { PersonenComponent } from './components/personen/personen.component';
import { PersonFormComponent } from './components/personen/person-form/person-form.component';
import { OrganisationseinheitListComponent } from './components/organisationseinheit/organisationseinheit-list/organisationseinheit-list.component';
// import { TaetigkeitenHistorischListComponent } from './components/taetigkeiten-historisch/taetigkeiten-historisch-list/taetigkeiten-historisch-list.component';
import { TaetigkeitenKorrigierenListComponent } from './components/taetigkeiten-korrigieren/taetigkeiten-korrigieren-list/taetigkeiten-korrigieren-list.component';
import { AbwesenheitKorrigierenListComponent } from './components/abwesenheit-korrigieren/abwesenheit-korrigieren-list/abwesenheit-korrigieren-list.component';
import { NachverrechnungListComponent } from './components/nachverrechnung/nachverrechnung-list/nachverrechnung-list.component';
import { BereitschaftKorrigierenListComponent } from './components/bereitschaft-korrigieren/bereitschaft-korrigieren-list/bereitschaft-korrigieren-list.component';
import { PersonenListComponent } from './components/personen2/personen-list/personen-list.component';
import { PersonenDetailComponent } from './components/personen/personen-detail/personen-detail.component';
import { AbsenceListComponent } from './components/absence/absence-list/absence-list.component';
import { AbsenceComponent } from './components/absence/absence/absence.component';
import { OrganizationdetailsComponent } from './components/organisition/organisation-details/organisation-details.component';
import { OrganizationlistComponent } from './components/organisition/organisation-list/organisation-list.component';
import { PresonsListComponent } from './components/persons/presons-list/presons-list.component';
import { ProdukteListComponent } from './components/produkte2/produkte-list/produkte-list.component';
import { ProdukteDetailComponent } from './components/produkte2/produkte-detail/produkte-detail.component';
// import { ProdukteDetailComponent } from './components/produkte2/produkte-detail/produkte-detail.component';
// import { VertragComponent } from './components/vertrag/vertrag.component';
// import { VertragDetailsComponent } from './components/vertrage2/vertrage-details';
import { FreigabeKorrigierenComponent } from './components/freigabe-korrigieren/freigabe-korrigieren.component';
import { FreigabeHistorischComponent } from './components/freigabe-historisch/freigabe-historisch.component';
import { FreigabeComponent } from './components/freigabe/freigabe.component';
import { VertrageListComponent } from './components/vertrage2/vertrage-list/vertrage-list.component';
import { VertrageDetailsComponent } from './components/vertrage2/vertrage-details/vertrage-details.component';
import { StempelzeitDetailsComponent } from './components/stempelzeit2/stempelzeit-details/stempelzeit-details.component';
import { StempelzeitListComponent } from './components/stempelzeit2/stempelzeit-list/stempelzeit-list.component';
import { ZivildienerListComponent } from './components/Zivildiener/zivildiener-list/zivildiener-list.component';
import { ZivildienerDetailsComponent } from './components/Zivildiener/zivildiener-details/zivildiener-details.component';
import { PersonenDetailsComponent } from './components/personen2/personen-details/personen-details.component';
// import { ZivildienerDetailsComponent}from './components/Zivildiener/zivildiener-details/zivildiener-details.component'
// import{Person} from './components/personen2/personen-list'
import {TatigkeitenHistorischListComponent} from './components/tätigkeiten-historisch2/tatigkeiten-historisch-list/tatigkeiten-historisch-list.component'
import { TatigkeitenHistorischDetailsComponent } from './components/tätigkeiten-historisch2/tatigkeiten-historisch-details/tatigkeiten-historisch-details.component';
export const routes: Routes = [
  { path: '', redirectTo: 'edit-absence', pathMatch: 'full' },
  { path: 'attendance', component: AttendanceListComponent },
  { path: 'anwesenheitsliste', component: AnwesenheitslisteListComponent },
  { path: 'book-activities', component: ActivityBookingComponent },
  // { path: 'activities-history', component: TaetigkeitenHistorischListComponent },
  { path: 'activities-history', component: TatigkeitenHistorischListComponent},
  { path: 'activities-history/:id', component: TatigkeitenHistorischDetailsComponent},

  { path: 'edit-activities', component: TaetigkeitenKorrigierenListComponent },
  { path: 'abwesenheit', component: AbwesenheitListComponent },
  { path: 'abwesenheit-2', component: AbsenceComponent },
  { path: 'freigabe', component: FreigabeComponent },
  { path: 'edit-absence', component: AbwesenheitKorrigierenListComponent },
  { path: 'calculation', component: NachverrechnungListComponent },
  { path: 'standby', component: BereitschaftKorrigierenListComponent },
  { path: 'freigabe-korrigieren', component: FreigabeKorrigierenComponent },
  { path: 'freigabe-history', component: FreigabeHistorischComponent },
  // { path: 'timestamps', component: StempelzeitListComponent },
  { path: 'timestamps/:id', component: StempelzeitDetailsComponent },
  { path: 'timestamps', component: StempelzeitListComponent },
  { path: 'persons', component: PersonenComponent },
  { path: 'preson2', component: PresonsListComponent },
  { path: 'person-form', component: PersonFormComponent },
  { path: 'personen', component: PersonenListComponent },
  { path: 'edit-personen/:id', component: PersonenDetailsComponent },
  { path: 'products', component: ProdukteListComponent },
  { path: 'contracts', component: VertrageListComponent },
  { path: 'organization', component: ProdukteDetailComponent },
  { path: 'organization2', component: OrganizationlistComponent },
  { path: 'organization/new', component: OrganizationdetailsComponent },
  { path: 'reports', component: TimeTrackingTableComponent },
  { path: 'exit', component: TimeTrackingTableComponent },
  { path: 'civilian/:id', component: ZivildienerDetailsComponent },
  { path: 'civilian-service', component: ZivildienerListComponent },
  { path: 'produkte/:id', component: ProdukteDetailComponent },
  { path: 'vertrag', component: VertrageListComponent },
  { path: 'vertrag/:id', component: VertrageDetailsComponent },
  { path: '**', redirectTo: 'edit-absence' },
];
