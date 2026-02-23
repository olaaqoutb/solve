import { ApiProduktPosition } from './ApiProduktPosition';
import { ApiTaetigkeitsbuchung } from './ApiTaetigkeitsbuchung';

export class ApiProduktPositionBuchungspunkt {
  id?:string;
  aktiv?: boolean;
  buchungspunkt?: string;
  produktPosition?: ApiProduktPosition;
  taetigkeitsbuchung?: ApiTaetigkeitsbuchung;
}
