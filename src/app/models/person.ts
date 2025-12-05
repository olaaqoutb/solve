export interface Person {
  id: string;
  vorname: string;
  nachname: string;
  aktiv: boolean;
  recht?: string[];
  mitarbeiterart?: string;
  funktion?: string[];
  vertrag?: string[];
  portalUser? : string;

  personId?: string;
  anwesend?: string;
  abwesenheitVorhanden?: boolean;
  logoff?: string;


  status?: 'active' | 'inactive';

  /** Family name / surname */
  familienname?: string;

   /** Total value */
  gesamt?: number;

  /** Planned value */
  geplant?: number;

  /** Booked value */
  gebucht?: number;

  /** Planned value for 2026 */
  geplant2026?: number;

  /** Role of the person */
  rolle?: string;

  stundenGeplantDiesesJahr? : string;
  stundenGebuchtDiesesJahr? :string;
  stundenkontingentJaehrlich?: string;

}


export interface StempelzeitDto {
    id?: string;
    version?: number;
    deleted?: boolean;
    loginSystem: string; // ISO Date string
    logoffSystem: string; // ISO Date string
    login: string; // ISO Date string
    logoff: string; // ISO Date string
    zeitTyp: string;
    poKorrektur: boolean;
    marker: string[];
    eintragungsart: string;
    anmerkung : string;
    person? : Person;
  }



  export interface Stempelzeit {
    id: string;
    version: number;
    deleted: boolean;
    login: string; // ISO Date string
    logoff: string; // ISO Date string
    zeitTyp: string;
    poKorrektur: boolean;
    marker: string[];
    eintragungsart: string;
  }

  export  interface Taetigkeitsbuchung {
    id: string;
    version: number;
    deleted: boolean;
    minutenDauer: number;
    taetigkeit: string;
    anmerkung: string;
    datum: string; // ISO Date string
    zeitTyp: string;
    tagesabschluss: boolean;
    tagesabschlussAufgehoben: boolean;
    monatsabschluss: boolean;
    buchungsart: string;
    freigabepositionVorhanden: boolean;
    verrechnetZeitraum?: string; // Optional because not all objects have it
    stempelzeit?: Stempelzeit; // Optional because not all objects have it
    buchungspunkt : ProduktPositionBuchungspunkt;
  }

  export interface ProduktPositionBuchungspunkt {
    id: string;
    version: number;
    deleted: boolean;
    aktiv: boolean;
    buchungspunkt: ProduktPositionBuchungspunkt;
    taetigkeitsbuchung: Taetigkeitsbuchung[];
    produktPosition : ProduktPosition;
   }

  export interface ProduktPosition {
    id: string;
    version: number;
    deleted: boolean;
    produktPositionname: string;
    start: string; // ISO Date string
    ende: string; // ISO Date string
    aktiv: boolean;
    auftraggeber: string;
    auftraggeberOrganisation: string;
    produktPositionTyp: string;
    buchungsfreigabe: boolean;
    produktPositionBuchungspunkt: ProduktPositionBuchungspunkt[];
    stundenplanung: any[]; // Placeholder, assuming it's an empty array
    produkt : Produkt;
    produktPosition : ProduktPosition;

  }

  export interface Produkt {
    id: string;
    version: number;
    deleted: boolean;
    produktname: string;
    start: string; // ISO Date string
    ende: string; // ISO Date string
    aktiv: boolean;
    kurzName: string;
    auftraggeber: string;
    auftraggeberOrganisation: string;
    produktTyp: string;
    produktPosition: ProduktPosition[];
    stundenplanung: any[]; // Placeholder, assuming it's an empty array
  }



  export enum ZeitTypDto {
    ARBEITSZEIT = "ARBEITSZEIT",
    REMOTEZEIT = "REMOTEZEIT",
    TELEARBEIT = "TELEARBEIT"
  }
