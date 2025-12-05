import { ApiStempelzeit } from './ApiStempelzeit';
import { ApiZeitTyp } from './ApiZeitTyp';
import { ApiTaetigkeitTyp } from './ApiTaetigkeitTyp';
import { ApiProduktPositionBuchungspunkt } from './ApiProduktPositionBuchungspunkt';
import { ApiBuchungsart } from './ApiBuchungsart';

export class ApiTaetigkeitsbuchung {
  minutenDauer?: number;
  taetigkeit?: ApiTaetigkeitTyp;
  buchungspunkt?: ApiProduktPositionBuchungspunkt;
  jiraTicket?: string;
  anmerkung?: string;
  datum?: string;
  zeitTyp?: ApiZeitTyp;
  tagesabschluss?: boolean;
  tagesabschlussAufgehoben?: boolean;
  monatsabschluss?: boolean;
  verrechnetZeitraum?: string;
  buchungsart?: ApiBuchungsart;
  freigabepositionVorhanden?: boolean;
  stempelzeit?: ApiStempelzeit;
}
