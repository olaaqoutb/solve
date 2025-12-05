import { ApiVertragPositionVerbraucher } from './ApiVertragPositionVerbraucher';

export class ApiVertragPosition {
  map(arg0: (position: any, posIndex: any) => { id: any; title: any; volumenE: number; volumenStd: number; geplant: any; expanded: boolean; children: any[]; }): any[] {
    throw new Error('Method not implemented.');
  }
  position?: string;
  volumenStunden?: string;
  volumenEuro?: string;
  anmerkung?: string;
  aktiv?: boolean;
  vertragPositionVerbraucher?: ApiVertragPositionVerbraucher;
  planungsjahr?: string;
  jahresuebertrag?: boolean;
  rollenbezeichnungRahmenvertrag?: string;
  stundenGeplant?: string;
  stundenGebucht?: string;
  length?: number;
}
