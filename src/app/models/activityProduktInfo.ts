import { ApiStempelzeit } from '../models-2/ApiStempelzeit';
import { ApiTaetigkeitsbuchung } from '../models-2/ApiTaetigkeitsbuchung';

export interface ActivityProduktInfo {
  produktKurzName?: string;
  produktname?: string;
  positionName?: string;
  buchungspunkt?: string;
  taetigkeit?: string;
  minutenDauer: number;
  anmerkung?: string;
  jiraTicket?: string;
  buchungsart?: string;
}

export type ActivityEntry =
  | {
      type: 'stempelzeit';
      data: ApiStempelzeit;
      buchung: ApiTaetigkeitsbuchung;
      produktInfo: ActivityProduktInfo;
    }
  | {
      type: 'duration';
      data: ApiTaetigkeitsbuchung;
      buchung: ApiTaetigkeitsbuchung;
      produktInfo: ActivityProduktInfo;
    };
