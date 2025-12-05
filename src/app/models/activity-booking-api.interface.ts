// API DTOs for REST communication
export interface TimeEntryDto {
  id: string;
  date: string; // ISO date string
  dayName: string;
  gestempelt: string;
  gebucht: string;
  status: 'abgeschlossen' | 'offen';
  activities?: ActivityDto[];
}

export interface ActivityDto {
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

export interface MonthSummaryDto {
  month: string;
  year: number;
  totalHours: string;
  status: 'abgeschlossen' | 'offen';
}

export interface CreateActivityRequest {
  timeEntryId: string;
  product: string;
  productPosition: string;
  bookingPoint: string;
  activityType: string;
  hours: number;
  minutes: number;
  description?: string;
  jiraTicket?: string;
}

export interface UpdateActivityRequest {
  id: string;
  product?: string;
  productPosition?: string;
  bookingPoint?: string;
  activityType?: string;
  hours?: number;
  minutes?: number;
  description?: string;
  jiraTicket?: string;
}

export interface DropdownOptionsDto {
  products: string[];
  productPositions: string[];
  bookingPoints: string[];
  activityTypes: string[];
}
