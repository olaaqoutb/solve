export interface TaetigkeitNode {
  monthName?: string | undefined;
  gebuchtTotal?: string | undefined;
  dayName?: string | undefined;
  gestempelt?: string | undefined;
  gebucht?: string | undefined;
  productName?: string | undefined;
  positionName?: string | undefined;
  gebuchtTime?: string | undefined;
  timeRange?: string | undefined;
  name?: string;
  children?: TaetigkeitNode[];
  hasNotification?: boolean;
  formData?: any;
  stempelzeitData?: any;
  stempelzeitenList?: string[];
}
