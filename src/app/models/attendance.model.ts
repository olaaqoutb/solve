export interface AbsenceRecord {
  beginn: string;
  ende: string;
  tage: number;
}

export interface AttendanceEntry {
  familienname: string;
  //vorname: string;
  abwesendBis?: string;
 // mitarbeiterart: string;
  status?: string;
  icon?: string; // e.g. 'person', 'home', etc.
  absences?: AbsenceRecord[];


  id: number;
  vorname: string;
  nachname?: string;
  aktiv?: boolean;
  recht?: string[];
  mitarbeiterart: string;
  funktion?: string[];
  vertrag?: string[];
  portalUser? : string;

  personId?: string;
  anwesend?: string;
  abwesenheitVorhanden?: boolean;
  logoff?: string;
}


export interface AbsencePeriod {
  id?: number;
  employeeId?: number;
  beginn: string;
  ende: string;
  tage?: number;

   version?: number;
  deleted?: boolean;
  login?: string;
  logoff?: string;  
  zeitTyp?: string;
  poKorrektur?: boolean;
  marker?: any[];  
  eintragungsart?: string;

}