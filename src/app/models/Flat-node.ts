export interface FlatNode {
  expandable: boolean;
  name: string|undefined;
  level: number;
  hasNotification?: boolean;
  formData?:any;
  stempelzeitData?: any;
  monthName?: string;
  gebuchtTotal?: string;
  dayName?: string;
  gestempelt?: string;
  gebucht?: string;
  stempelzeitenList?: string[];
  productName?: string;
  positionName?: string;
  gebuchtTime?: string;
  timeRange?: string;
  hasAlarm?: boolean;
  alarmData?: any;
  hasEntries?: boolean;

}
