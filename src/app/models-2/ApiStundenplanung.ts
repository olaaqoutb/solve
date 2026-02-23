import { ApiVertragPositionVerbraucher } from './ApiVertragPositionVerbraucher';
import { ApiProdukt } from './ApiProdukt';
import { ApiProduktPosition } from './ApiProduktPosition';

export class ApiStundenplanung {
  id?:string;
  anmerkung?: string;
  stundenGeplant?: string;
  vertragPositionVerbraucher?: ApiVertragPositionVerbraucher;
  produktPosition?: ApiProduktPosition;
  produkt?: ApiProdukt;
}
