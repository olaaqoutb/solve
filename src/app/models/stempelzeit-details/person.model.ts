export interface Person {
  id?: string;
  nachname: string;
  vorname: string;
  mitarbeiterart: string;
  aktiv: boolean;
  anwesend?: string;
  logoff?: string;
  abwesenheitVorhanden?: boolean;
  email?: string;
  bucher?: string;
  geprueft?: boolean;
  portalUser?: string;
  rolle?: string;
  stundenkontingentJaehrlich?: string;
}
