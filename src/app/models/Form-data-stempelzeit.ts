import { ApiZeitTyp } from "../models-2/ApiZeitTyp";

export interface FormDataStempelzeit {
  datum: string;
  zeittyp: ApiZeitTyp | string;
  anmeldezeit: { stunde: number; minuten: number };
  abmeldezeit: { stunde: number; minuten: number };
  anmerkung: string;
}
