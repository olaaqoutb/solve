import { ApiLkDetails } from './ApiLkDetails';
import { ApiTrigger } from './ApiTrigger';
import { ApiPerson } from './ApiPerson';
import { ApiVertragPosition } from './ApiVertragPosition';
import { ApiVertragsTyp } from './ApiVertragsTyp';
import { ApiVertragBezugsart } from './ApiVertragBezugsart';

export class ApiVertrag {
  vertragsname?: string;
  vertragspartner?: string;
  erstelldatum?: string;
  gueltigVon?: string;
  gueltigBis?: string;
  aktiv?: boolean;
  auftraggeber?: string;
  vertragszusatz?: string;
  auftragsreferenz?: string;
  elak?: string;
  beschaffungsnummer?: string;
  anmerkung?: string;
  vertragssumme?: string;
  vertragsTyp?: ApiVertragsTyp;
  vertragPosition?: ApiVertragPosition;
  vertragsverantwortlicher?: ApiPerson;
  bezugsart?: ApiVertragBezugsart;
  geschaeftszahl?: string;
  lkKennung?: boolean;
  lkBasisstundensatz?: string;
  volumenLeistungspunkte?: string;
  lkDetails?: ApiLkDetails;
  trigger?: ApiTrigger;
  stundenGeplant?: string;
  stundenGebucht?: string;
  id?: string;
}
