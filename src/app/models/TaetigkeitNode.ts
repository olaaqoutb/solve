export interface TaetigkeitNode {
  alarmData?: null;
  hasAlarm?: boolean;
  monthName?: string | undefined;
  gebuchtTotal?: string | undefined;
  dayName?: string | undefined;
  gestempelt?: string | undefined;
  gebucht?: string | undefined;
  productName?: string | undefined;
  positionName?: string | undefined;
  gebuchtTime?: string | undefined;
  gestempeltTime?: string | undefined;
  timeRange?: string | undefined;
  name?: string;
  children?: TaetigkeitNode[];
  hasNotification?: boolean;
  formData?: any;
  stempelzeitData?: any;
  stempelzeitenList?: string[];
  hasEntries?: boolean;

}
