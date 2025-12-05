import { FormData } from './FormData.model';
import { TimeEntry } from './TimeEntry.model';

export interface StempelzeitNode {
  name: string;
  date?: string;
  children?: StempelzeitNode[];
  hasNotification?: boolean;
  formData?: FormData;
  timeEntry?: TimeEntry;
}
