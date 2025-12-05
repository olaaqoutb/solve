export interface TimeEntry {
  id: string;
  date: Date;
  dayName: string;
  gestempelt: string;
  gebucht: string;
  status: 'abgeschlossen' | 'offen';
  activities?: Activity[];
}

export interface Activity {
  id: string;
  title: string;
  product: string;
  productPosition: string;
  bookingPoint: string;
  activityType: string;
  duration: {
    hours: number;
    minutes: number;
  };
  description: string;
  jiraTicket: string;
  timeRange: string;
}

export interface MonthSummary {
  month: string;
  year: number;
  totalHours: string;
  status: 'abgeschlossen' | 'offen';
}
