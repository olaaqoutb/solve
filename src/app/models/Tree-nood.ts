import { ApiStempelzeit } from "../models-2/ApiStempelzeit";
import { FormDataStempelzeit } from "../models/Form-data-stempelzeit";
export interface TreeNode {
  name: string;
  level: number;
  expandable: boolean;
  year?: string;
  sollArbeitszeit?: string;
  saldo?: string;
  urlaubstage?: string;
  urlaub?: string;
  arbeitszeit?: string;
  zeitTyp?: string;
  login?: string;
  logoff?: string;
  anmerkung?: string;
  children?: TreeNode[];
  stempelzeit?: ApiStempelzeit;
  formData?: FormDataStempelzeit;
}