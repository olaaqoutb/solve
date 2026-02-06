import { ApiZeitTyp } from './ApiZeitTyp';
import { ApiStempelzeitMarker } from './ApiStempelzeitMarker';
import { ApiPerson } from './ApiPerson';

export class ApiStempelzeit {
  person?: ApiPerson;
  loginSystem?: string;
  logoffSystem?: string;
  login?: string;
  logoff?: string;
  anmerkung?: string;
  zeitTyp?: ApiZeitTyp;
  poKorrektur?: boolean;
  marker?: ApiStempelzeitMarker;
  id?: string; //added  this for test and i will remove it
}
