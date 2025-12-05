export interface TimeEntry {
  id: string;
  version: number;
  deleted: boolean;
  login: string;
  logoff: string;
  zeitTyp: string;
  poKorrektur: boolean;
  marker: string[];
  eintragungsart: string;
  loginSystem?: string;
  logoffSystem?: string;
}
