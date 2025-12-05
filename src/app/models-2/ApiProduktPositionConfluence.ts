import { ApiPersonConfluence } from './ApiPersonConfluence';

export class ApiProduktPositionConfluence {
  aktiv?: boolean;
  bezeichnung?: string;
  durchfuehrungsverantwortlicher?: ApiPersonConfluence;
  servicemanager?: ApiPersonConfluence;
}
