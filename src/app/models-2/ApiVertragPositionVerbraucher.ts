import { ApiVerbraucherTyp } from './ApiVerbraucherTyp';
import { ApiLkDetails } from './ApiLkDetails';
import { ApiStundenplanung } from './ApiStundenplanung';
import { ApiTrigger } from './ApiTrigger';
import { ApiPerson } from './ApiPerson';

export class ApiVertragPositionVerbraucher {
  verbraucher?: string;
  volumenStunden?: string;
  stundenpreis?: string;
  volumenEuro?: string;
  verbraucherTyp?: ApiVerbraucherTyp;
  aktiv?: boolean;
  anmerkung?: string;
  lkKennung?: boolean;
  stundenGeplant?: string;
  stundenGebucht?: string;
  person?: ApiPerson;
  stundenplanung?: ApiStundenplanung;
  lkDetails?: ApiLkDetails;
  trigger?: ApiTrigger;
}
