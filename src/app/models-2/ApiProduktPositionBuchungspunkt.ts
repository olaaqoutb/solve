import { ApiProduktPosition } from './ApiProduktPosition';
import { ApiTaetigkeitsbuchung } from './ApiTaetigkeitsbuchung';

export class ApiProduktPositionBuchungspunkt {
  aktiv?: boolean;
  buchungspunkt?: string;
  produktPosition?: ApiProduktPosition;
  taetigkeitsbuchung?: ApiTaetigkeitsbuchung;
}
