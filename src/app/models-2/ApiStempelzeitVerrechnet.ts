import { ApiZeitTyp } from './ApiZeitTyp';
import { ApiPerson } from './ApiPerson';

export class ApiStempelzeitVerrechnet {
  portalUser?: string;
  person?: ApiPerson;
  loginSystem?: string;
  logoffSystem?: string;
  login?: string;
  logoff?: string;
  anmerkung?: string;
  zeitTyp?: ApiZeitTyp;
}
