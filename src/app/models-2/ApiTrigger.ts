import { ApiTriggerMetaDaten } from './ApiTriggerMetaDaten';
import { ApiTriggerAktion } from './ApiTriggerAktion';
import { ApiTriggerStatus } from './ApiTriggerStatus';

export class ApiTrigger {
  aktion?: ApiTriggerAktion;
  aktionStatus?: ApiTriggerStatus;
  aktionTime?: string;
  aktionMetaDaten?: ApiTriggerMetaDaten;
}
