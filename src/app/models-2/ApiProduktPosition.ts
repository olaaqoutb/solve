import { ApiStundenplanung } from './ApiStundenplanung';
import { ApiPerson } from './ApiPerson';
import { ApiProdukt } from './ApiProdukt';
import { ApiFreigabeGruppe } from './ApiFreigabeGruppe';
import { ApiProduktPositionBuchungspunkt } from './ApiProduktPositionBuchungspunkt';
import { ApiProduktPositionTyp } from './ApiProduktPositionTyp';

export class ApiProduktPosition {
  produktPositionname?: string;
  start?: string;
  ende?: string;
  aktiv?: boolean;
  anmerkung?: string;
  auftraggeber?: string;
  auftraggeberOrganisation?: string;
  durchfuehrungsverantwortlicher?: ApiPerson;
  servicemanager?: ApiPerson;
  produktPositionTyp?: ApiProduktPositionTyp;
  buchungsfreigabe?: boolean;
  produktPositionBuchungspunkt?: ApiProduktPositionBuchungspunkt;
  produkt?: ApiProdukt;
  stundenplanung?: ApiStundenplanung;
  stundenGebucht?: string;
  freigabegruppe?: ApiFreigabeGruppe;
}
