import { ApiBuchungsart } from '../models-2/ApiBuchungsart';
import { ApiTaetigkeitTyp } from '../models-2/ApiTaetigkeitTyp';
import { ApiProduktPositionBuchungspunkt } from '../models-2/ApiProduktPositionBuchungspunkt';
import { ApiProduktPosition } from '../models-2/ApiProduktPosition';
import { ApiProdukt } from '../models-2/ApiProdukt';

export interface TaetigkeitFormValue {
  datum: Date | string;
  buchungsart?: ApiBuchungsart | string;   // string for form, cast when building DTO
  produkt?: ApiProdukt | string;
  produktposition?: ApiProduktPosition | string;
  buchungspunkt?: ApiProduktPositionBuchungspunkt | string;
  taetigkeit?: ApiTaetigkeitTyp | string;
  anmeldezeitStunde?: number;
  anmeldezeitMinuten?: number;
  abmeldezeitStunde?: number;
  abmeldezeitMinuten?: number;
  durationStunde?: number;
  durationMinuten?: number;
  minutenDauer?: number;
  gestempelt?: string;
  gebucht?: string;
  anmerkung?: string;
  jiraTicket?: string;
  anmeldezeit?: { stunde: number; minuten: number };
  abmeldezeit?: { stunde: number; minuten: number };
  hasAlarm?: boolean;

}
