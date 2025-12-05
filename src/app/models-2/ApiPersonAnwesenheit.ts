import { ApiAnwesendStatus } from './ApiAnwesendStatus';
import { ApiMitarbeiterart } from './ApiMitarbeiterart';

export class ApiPersonAnwesenheit {
  vorname?: string;
  nachname?: string;
  portalUser?: string;
  personId?: string;
  mitarbeiterart?: ApiMitarbeiterart;
  logoff?: string;
  anwesend?: ApiAnwesendStatus;
  abwesenheitVorhanden?: boolean;
}
