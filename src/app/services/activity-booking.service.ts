import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  TimeEntryDto,
  ActivityDto,
  MonthSummaryDto,
  CreateActivityRequest,
  UpdateActivityRequest,
  DropdownOptionsDto,
} from '../interfaces/activity-booking-api.interface';

@Injectable({
  providedIn: 'root',
})
export class ActivityBookingService {
  private readonly baseUrl = '/api/activity-booking'; // This would be configured in environment

  constructor(private http: HttpClient) {}

  // Get month summaries for the user
  getMonthSummaries(): Observable<MonthSummaryDto[]> {
    // return this.http.get<MonthSummaryDto[]>(`${this.baseUrl}/month-summaries`);

    // Dummy implementation for development
    const summaries: MonthSummaryDto[] = [
      {
        month: 'April 2025',
        year: 2025,
        totalHours: '74:35',
        status: 'abgeschlossen',
      },
      {
        month: 'Mai 2025',
        year: 2025,
        totalHours: '78:00',
        status: 'offen',
      },
    ];
    return of(summaries).pipe(delay(500));
  }

  // Get time entries for a specific month
  getTimeEntries(month: string, year: number): Observable<TimeEntryDto[]> {
    // return this.http.get<TimeEntryDto[]>(`${this.baseUrl}/time-entries`, {
    //   params: { month, year: year.toString() }
    // });

    // Dummy implementation for development
    const entries: TimeEntryDto[] = [
      {
        id: '1',
        date: '2025-05-02',
        dayName: 'Fr.',
        gestempelt: '05:42',
        gebucht: '05:40',
        status: 'abgeschlossen',
        activities: [
          {
            id: 'a1',
            title: 'Tätigkeitsbericht IV/2 GUI Erneuerung',
            product: 'GETIT Tätigkeitsbericht IV/2',
            productPosition: 'GUI Erneuerung',
            bookingPoint: 'GUI Erneuerung',
            activityType: 'Programmierung',
            duration: { hours: 5, minutes: 40 },
            description: 'GETIT - Implementierung von Abwesenheiten Maske',
            jiraTicket: 'GETIT-731',
            timeRange: '07:14 - 12:56',
          },
        ],
      },
      {
        id: '2',
        date: '2025-05-05',
        dayName: 'Mo.',
        gestempelt: '07:52',
        gebucht: '07:25',
        status: 'abgeschlossen',
      },
      {
        id: '3',
        date: '2025-05-06',
        dayName: 'Di.',
        gestempelt: '10:04',
        gebucht: '09:30',
        status: 'abgeschlossen',
      },
      {
        id: '4',
        date: '2025-05-07',
        dayName: 'Mi.',
        gestempelt: '09:18',
        gebucht: '09:00',
        status: 'abgeschlossen',
      },
      {
        id: '5',
        date: '2025-05-08',
        dayName: 'Do.',
        gestempelt: '09:01',
        gebucht: '08:30',
        status: 'abgeschlossen',
      },
      {
        id: '6',
        date: '2025-05-09',
        dayName: 'Fr.',
        gestempelt: '05:02',
        gebucht: '05:00',
        status: 'abgeschlossen',
      },
      {
        id: '7',
        date: '2025-05-12',
        dayName: 'Mo.',
        gestempelt: '08:45',
        gebucht: '08:15',
        status: 'abgeschlossen',
      },
      {
        id: '8',
        date: '2025-05-13',
        dayName: 'Di.',
        gestempelt: '09:55',
        gebucht: '09:25',
        status: 'abgeschlossen',
      },
      {
        id: '9',
        date: '2025-05-14',
        dayName: 'Mi.',
        gestempelt: '08:03',
        gebucht: '07:40',
        status: 'abgeschlossen',
      },
      {
        id: '10',
        date: '2025-05-15',
        dayName: 'Do.',
        gestempelt: '07:43',
        gebucht: '07:35',
        status: 'abgeschlossen',
      },
      {
        id: '11',
        date: '2025-05-16',
        dayName: 'Fr.',
        gestempelt: '04:48',
        gebucht: '00:00',
        status: 'offen',
      },
      {
        id: '12',
        date: '2025-05-19',
        dayName: 'Mo.',
        gestempelt: '08:36',
        gebucht: '00:00',
        status: 'offen',
      },
    ];
    return of(entries).pipe(delay(500));
  }

  // Get dropdown options for the form
  getDropdownOptions(): Observable<DropdownOptionsDto> {
    // return this.http.get<DropdownOptionsDto>(`${this.baseUrl}/dropdown-options`);

    // Dummy implementation for development
    return of({
      products: [
        'GETIT Tätigkeitsbericht IV/2',
        'BMI Portal System',
        'Anwesenheitsverwaltung',
        'Zeiterfassung Plus',
      ],
      productPositions: [
        'GUI Erneuerung',
        'Backend Development',
        'Database Design',
        'Testing & QA',
      ],
      bookingPoints: [
        'GUI Erneuerung',
        'API Development',
        'Database Migration',
        'System Integration',
      ],
      activityTypes: [
        'Programmierung',
        'Testing',
        'Dokumentation',
        'Meeting',
        'Analyse',
      ],
    }).pipe(delay(300));
  }

  // Create a new activity
  createActivity(request: CreateActivityRequest): Observable<ActivityDto> {
    // return this.http.post<ActivityDto>(`${this.baseUrl}/activities`, request);

    // Dummy implementation for development
    const newActivity: ActivityDto = {
      id: Date.now().toString(),
      title: `${request.activityType} - ${request.product}`,
      product: request.product,
      productPosition: request.productPosition,
      bookingPoint: request.bookingPoint,
      activityType: request.activityType,
      duration: {
        hours: request.hours,
        minutes: request.minutes,
      },
      description: request.description || '',
      jiraTicket: request.jiraTicket || '',
      timeRange: '08:00 - 16:00', // This would be calculated by the backend
    };

    return of(newActivity).pipe(delay(500));
  }

  // Update an existing activity
  updateActivity(request: UpdateActivityRequest): Observable<ActivityDto> {
    // return this.http.put<ActivityDto>(`${this.baseUrl}/activities/${request.id}`, request);

    // Dummy implementation for development
    const updatedActivity: ActivityDto = {
      id: request.id,
      title: `${request.activityType} - ${request.product}`,
      product: request.product || '',
      productPosition: request.productPosition || '',
      bookingPoint: request.bookingPoint || '',
      activityType: request.activityType || '',
      duration: {
        hours: request.hours || 0,
        minutes: request.minutes || 0,
      },
      description: request.description || '',
      jiraTicket: request.jiraTicket || '',
      timeRange: '08:00 - 16:00',
    };

    return of(updatedActivity).pipe(delay(500));
  }

  // Delete an activity
  deleteActivity(activityId: string): Observable<void> {
    // return this.http.delete<void>(`${this.baseUrl}/activities/${activityId}`);

    // Dummy implementation for development
    return of(void 0).pipe(delay(300));
  }

  // Get activities for a specific time entry
  getActivitiesForTimeEntry(timeEntryId: string): Observable<ActivityDto[]> {
    // return this.http.get<ActivityDto[]>(`${this.baseUrl}/time-entries/${timeEntryId}/activities`);

    // Dummy implementation for development
    return of([]).pipe(delay(300));
  }

  // Close/finalize a time entry
  closeTimeEntry(timeEntryId: string): Observable<TimeEntryDto> {
    // return this.http.post<TimeEntryDto>(`${this.baseUrl}/time-entries/${timeEntryId}/close`, {});

    // Dummy implementation for development
    const closedEntry: TimeEntryDto = {
      id: timeEntryId,
      date: '2025-05-16',
      dayName: 'Fr.',
      gestempelt: '04:48',
      gebucht: '04:48',
      status: 'abgeschlossen',
    };
    return of(closedEntry).pipe(delay(500));
  }

  // Reopen a time entry
  reopenTimeEntry(timeEntryId: string): Observable<TimeEntryDto> {
    // return this.http.post<TimeEntryDto>(`${this.baseUrl}/time-entries/${timeEntryId}/reopen`, {});

    // Dummy implementation for development
    const reopenedEntry: TimeEntryDto = {
      id: timeEntryId,
      date: '2025-05-16',
      dayName: 'Fr.',
      gestempelt: '04:48',
      gebucht: '00:00',
      status: 'offen',
    };
    return of(reopenedEntry).pipe(delay(500));
  }
}
