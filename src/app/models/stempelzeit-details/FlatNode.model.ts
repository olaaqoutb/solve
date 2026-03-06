import { ApiStempelzeit } from '../../models-2/ApiStempelzeit';
import { FormData } from './FormData.model';
import { TimeEntry } from './TimeEntry.model';

export interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  hasNotification: boolean;
  formData?: FormData;
  timeEntry?: ApiStempelzeit;
}
