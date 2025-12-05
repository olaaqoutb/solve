import { ApiPerson } from './ApiPerson';
 
export class ApiOrganisationseinheit {
  bezeichnung?: string;
  kurzBezeichnung?: string;
  gueltigVon?: string;
  gueltigBis?: string;
  email?: string;
  leiter?: ApiPerson;
  parent?: ApiOrganisationseinheit;
}
