export interface Organisationseinheit {
    id: string;
    version: number;
    deleted: boolean;
    bezeichnung: string;
    kurzBezeichnung: string;
    gueltigVon: string;
    gueltigBis: string;
    email: string[];
    parent?: Parent;
    leiter?: Leiter;
}


export interface Parent {
    id: string;
    version: number;
    deleted: boolean;
    bezeichnung: string;
    kurzBezeichnung: string;
    gueltigVon: string;
    gueltigBis: string;
    email: string[];
  }
  
  export interface Leiter {
    id: string;
    vorname: string;
    nachname: string;
    recht: any[];
    funktion: any[];
    vertrag: any[];
  }
  