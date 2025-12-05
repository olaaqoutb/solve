 


export interface AbwesenheitItem {
    id?: string | null;
    loginSystem: string;
    logoffSystem: string;
    login: string;
    logoff: string;
    anmerkung: string;
    zeitTyp: string;
    poKorrektur: boolean;
    marker: string[];
    eintragungsart: string;
    selected?:boolean;
  }