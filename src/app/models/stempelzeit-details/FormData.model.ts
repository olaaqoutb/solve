import { TimeData } from './TimeData.model';

export interface FormData {
  datum: string;
  zeittyp: string;
  anmeldezeit: TimeData;
  abmeldezeit: TimeData;
  anmerkung: string;
}
