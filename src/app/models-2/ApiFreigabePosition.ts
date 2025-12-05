import { ApiFreigabeStatus } from './ApiFreigabeStatus';
import { ApiPerson } from './ApiPerson';
import { ApiProduktPosition } from './ApiProduktPosition';
import { ApiFreigabePositionMetaDaten } from './ApiFreigabePositionMetaDaten';

export class ApiFreigabePosition {
  anmerkung?: string;
  freigabeStatus?: ApiFreigabeStatus;
  minutenDauer?: number;
  buchungsZeitraum?: string;
  produktPosition?: ApiProduktPosition;
  bucher?: ApiPerson;
  metadaten?: ApiFreigabePositionMetaDaten;
  letzteAenderungUser?: ApiPerson;
}
