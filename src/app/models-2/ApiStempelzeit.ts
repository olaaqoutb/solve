import { ApiZeitTyp } from './ApiZeitTyp';
import { ApiStempelzeitMarker } from './ApiStempelzeitMarker';
import { ApiPerson } from './ApiPerson';
import { ApiGetItEntitaet } from './ApiGetItEntitaet';
import { ApiStempelzeitEintragungsart } from './ApiStempelzeitEintragungsart';

export class ApiStempelzeit extends ApiGetItEntitaet {
  person?: ApiPerson;
  loginSystem?: string;
  logoffSystem?: string;
  login?: string;
  logoff?: string;
  anmerkung?: string;
  zeitTyp?: ApiZeitTyp;
  poKorrektur?: boolean;
  marker?: ApiStempelzeitMarker;
  eintragungsart?: ApiStempelzeitEintragungsart;
}
