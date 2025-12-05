import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  AbsenceTableDto,
  AbsenceDetailDto,
  CreateAbsenceRequest,
  UpdateAbsenceRequest,
  AbsenceResponse,
  AbsencesResponse,
} from '../models/absence.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AbsenceService {
  private apiUrl = `${environment.apiBaseUrl}/absences`;
  private absenceListSubject = new BehaviorSubject<AbsenceTableDto[]>([]);

  constructor(private http: HttpClient) {
    // Initialize with dummy data
    this.generateDummyData();
  }
  // CRUD Operations
  getAbsences(
    personId?: string | null,
    startDate?: string,
    endDate?: string,
    page = 0,
    pageSize = 10
  ): Observable<AbsencesResponse> {
    // In a real application, this would call the API
    // For now, we'll simulate the API call with our dummy data
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    if (personId) {
      params = params.set('personId', personId);
    }

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    // Simulate HTTP delay
    return of({
      data: this.filterAbsences(personId, startDate, endDate),
      success: true,
      message: 'Abwesenheiten erfolgreich geladen',
      total: this.absenceListSubject.value.length,
    }).pipe(delay(300));

    // Real implementation would be:
    // return this.http.get<AbsencesResponse>(this.apiUrl, { params });
  }

  getAbsence(id: string): Observable<AbsenceResponse> {
    // Simulate HTTP delay
    const foundAbsence = this.findAbsenceById(id);

    return of({
      data: foundAbsence,
      success: true,
      message: 'Abwesenheit erfolgreich geladen',
    }).pipe(delay(300));

    // Real implementation would be:
    // return this.http.get<AbsenceResponse>(`${this.apiUrl}/${id}`);
  }

  createAbsence(absence: CreateAbsenceRequest): Observable<AbsenceResponse> {
    // Generate a new ID for the absence
    const newId = `abs-${Math.floor(Math.random() * 1000)}`;

    const newAbsence: AbsenceDetailDto = {
      id: newId,
      personId: absence.personId,
      startDate: absence.startDate,
      startTime: absence.startTime,
      endDate: absence.endDate,
      endTime: absence.endTime,
      comment: absence.comment,
    };

    // Add the new absence to the list
    const currentAbsences = this.absenceListSubject.value;
    this.absenceListSubject.next([...currentAbsences, newAbsence]);

    // Simulate HTTP delay
    return of({
      data: newAbsence,
      success: true,
      message: 'Abwesenheit erfolgreich erstellt',
    }).pipe(delay(300));

    // Real implementation would be:
    // return this.http.post<AbsenceResponse>(this.apiUrl, absence);
  }

  updateAbsence(absence: UpdateAbsenceRequest): Observable<AbsenceResponse> {
    // Find the absence to update
    const currentAbsences = this.absenceListSubject.value;
    const index = currentAbsences.findIndex((abs) => abs.id === absence.id);

    if (index !== -1) {
      // Update the absence
      const updatedAbsence: AbsenceDetailDto = {
        id: absence.id,
        personId: absence.personId,
        startDate: absence.startDate,
        startTime: absence.startTime,
        endDate: absence.endDate,
        endTime: absence.endTime,
        comment: absence.comment,
      };

      const updatedAbsences = [...currentAbsences];
      updatedAbsences[index] = updatedAbsence;
      this.absenceListSubject.next(updatedAbsences);

      // Simulate HTTP delay
      return of({
        data: updatedAbsence,
        success: true,
        message: 'Abwesenheit erfolgreich aktualisiert',
      }).pipe(delay(300));
    }

    // If not found, return an error
    return of({
      data: {} as AbsenceDetailDto,
      success: false,
      message: 'Abwesenheit nicht gefunden',
    }).pipe(delay(300));

    // Real implementation would be:
    // return this.http.put<AbsenceResponse>(`${this.apiUrl}/${absence.id}`, absence);
  }

  deleteAbsence(id: string): Observable<AbsenceResponse> {
    // Find the absence to delete
    const currentAbsences = this.absenceListSubject.value;
    const index = currentAbsences.findIndex((abs) => abs.id === id);

    if (index !== -1) {
      // Delete the absence
      const deletedAbsence = currentAbsences[index];
      const updatedAbsences = currentAbsences.filter((abs) => abs.id !== id);
      this.absenceListSubject.next(updatedAbsences);

      // Simulate HTTP delay
      return of({
        data: deletedAbsence,
        success: true,
        message: 'Abwesenheit erfolgreich gelöscht',
      }).pipe(delay(300));
    }

    // If not found, return an error
    return of({
      data: {} as AbsenceDetailDto,
      success: false,
      message: 'Abwesenheit nicht gefunden',
    }).pipe(delay(300));

    // Real implementation would be:
    // return this.http.delete<AbsenceResponse>(`${this.apiUrl}/${id}`);
  }

  // Helper methods for dummy data
  private generateDummyData(): void {
    const absences: AbsenceTableDto[] = [
      {
        id: 'abs-1',
        personId: 'person-1',
        personName: 'Hassan Terab',
        startDate: '01.07.2025',
        startTime: '01:00',
        endDate: '10.07.2025',
        endTime: '24:00',
        comment: '',
      },
      {
        id: 'abs-2',
        personId: 'person-1',
        personName: 'Hassan Terab',
        startDate: '03.08.2025',
        startTime: '00:00',
        endDate: '03.08.2025',
        endTime: '24:00',
        comment: '',
      },
      // Add more dummy absences as needed
    ];

    this.absenceListSubject.next(absences);
  }
  private filterAbsences(
    personId?: string | null,
    startDate?: string,
    endDate?: string
  ): AbsenceTableDto[] {
    let filteredAbsences = this.absenceListSubject.value;

    if (personId) {
      filteredAbsences = filteredAbsences.filter(
        (absence) => absence.personId === personId
      );
    }

    // Add more filtering logic for dates if needed

    return filteredAbsences;
  }

  private findAbsenceById(id: string): AbsenceDetailDto {
    const absence = this.absenceListSubject.value.find((abs) => abs.id === id);

    if (!absence) {
      throw new Error('Absence not found');
    }

    return {
      ...absence,
    };
  }
}
