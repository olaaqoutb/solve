export interface PersonListInterface {
  id: string;
  vorname: string;
  nachname: string;
  portalUser?: string;
  email?: string;
  aktiv: boolean;
  rolle: string;
  recht: string[];
  mitarbeiterart?: string;
  geprueft: boolean;
  stundenkontingentJaehrlich?: string;
  funktion: string[];
  vertrag: any[];
  bucher?: string;
  titel?: string;
  stundenkontingentJaehrlichVertrag?: string;
  stundenGeplantDiesesJahr?: number;
  stundenGebuchtDiesesJahr?: string;
}



