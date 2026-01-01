import { Injectable } from '@angular/core';
import { TaetigkeitNode } from '../../models/TaetigkeitNode';

export interface TimeValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface OverlapResult {
  hasOverlap: boolean;
  overlappingEntry?: string;
}

export interface CompleteValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeOverlapService {

  /**
   * MAIN METHOD: Complete validation for Bereitschaft form
   * Validates: date format, hour 24 rule, time logic, and overlaps
   * Use this for Bereitschaft components
   */
  validateBereitschaftEntry(
    formValue: any,
    treeData: TaetigkeitNode[],
    excludeEntryId?: string
  ): CompleteValidationResult {
    // 1. Check date validity
    const startDate = this.parseGermanDate(formValue.startDatum);
    const endDate = this.parseGermanDate(formValue.endeDatum);

    if (!startDate || !endDate) {
      return {
        isValid: false,
        errorMessage: 'Ungültiges Datumformat. Bitte verwenden Sie TT.MM.JJJJ'
      };
    }

    // 2. Check hour 24 rule
    if (formValue.startStunde === 24 && formValue.startMinuten !== 0) {
      return {
        isValid: false,
        errorMessage: 'Start: Bei 24 Stunden müssen die Minuten 0 sein'
      };
    }

    if (formValue.endeStunde === 24 && formValue.endeMinuten !== 0) {
      return {
        isValid: false,
        errorMessage: 'Ende: Bei 24 Stunden müssen die Minuten 0 sein'
      };
    }

    // 3. Create date objects
    const loginDate = new Date(startDate);
    loginDate.setHours(formValue.startStunde, formValue.startMinuten, 0, 0);
    const logoffDate = new Date(endDate);
    logoffDate.setHours(formValue.endeStunde, formValue.endeMinuten, 0, 0);

    // 4. Check time logic
    if (logoffDate <= loginDate) {
      return {
        isValid: false,
        errorMessage: 'Ende-Zeitpunkt muss nach Start-Zeitpunkt liegen'
      };
    }

    // 5. Check for overlaps
    const overlapCheck = this.checkForTimeOverlaps(
      loginDate,
      logoffDate,
      treeData,
      excludeEntryId
    );

    if (overlapCheck.hasOverlap) {
      return {
        isValid: false,
        errorMessage: `Zeitüberschneidung erkannt: ${overlapCheck.overlappingEntry}`
      };
    }

    return { isValid: true };
  }

  /**
   * LEGACY METHOD: Validate time entry for overlaps with existing entries
   * Keep this for backward compatibility with other components
   * Use for components with anmeldezeit/abmeldezeit naming
   */
  validateTimeEntryOverlap(
    formValue: any,
    treeData: TaetigkeitNode[],
    excludeEntryId?: string
  ): TimeValidationResult {
    const {
      datum,
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    if (!datum || typeof datum !== 'string' || datum.trim() === '') {
      return {
        isValid: false,
        errorMessage: 'Datum ist erforderlich'
      };
    }

    // Check hour 24 rule FIRST
    if (anmeldezeitStunde === 24 && anmeldezeitMinuten !== 0) {
      return {
        isValid: false,
        errorMessage: 'Start: Bei 24 Stunden müssen die Minuten 0 sein'
      };
    }

    if (abmeldezeitStunde === 24 && abmeldezeitMinuten !== 0) {
      return {
        isValid: false,
        errorMessage: 'Ende: Bei 24 Stunden müssen die Minuten 0 sein'
      };
    }

    if (!this.isTimeValid(formValue)) {
      return {
        isValid: false,
        errorMessage: 'Ungültige Zeitangaben: Abmeldezeit muss nach Anmeldezeit liegen'
      };
    }

    const selectedDate = this.parseGermanDate(datum);
    if (!selectedDate) {
      return {
        isValid: false,
        errorMessage: 'Ungültiges Datumformat. Bitte verwenden Sie TT.MM.JJJJ'
      };
    }

    const startTime = new Date(selectedDate);
    startTime.setHours(anmeldezeitStunde, anmeldezeitMinuten, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(abmeldezeitStunde, abmeldezeitMinuten, 0, 0);

    const overlaps = this.checkForTimeOverlaps(
      startTime,
      endTime,
      treeData,
      excludeEntryId
    );

    if (overlaps.hasOverlap) {
      return {
        isValid: false,
        errorMessage: `Zeitüberschneidung mit bestehendem Eintrag: ${overlaps.overlappingEntry}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate if time entry is valid (basic time rules)
   * For anmeldezeit/abmeldezeit format
   */
  isTimeValid(formValue: any): boolean {
    const {
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    // Check if values are within valid ranges
    if (anmeldezeitStunde < 0 || anmeldezeitStunde > 24 ||
      abmeldezeitStunde < 0 || abmeldezeitStunde > 24 ||
      anmeldezeitMinuten < 0 || anmeldezeitMinuten > 59 ||
      abmeldezeitMinuten < 0 || abmeldezeitMinuten > 59) {
      return false;
    }

    // Check if hour is 24, minutes must be 0
    if ((anmeldezeitStunde === 24 && anmeldezeitMinuten !== 0) ||
      (abmeldezeitStunde === 24 && abmeldezeitMinuten !== 0)) {
      return false;
    }

    // Convert to total minutes for comparison
    const startTotalMinutes = anmeldezeitStunde * 60 + anmeldezeitMinuten;
    const endTotalMinutes = abmeldezeitStunde * 60 + abmeldezeitMinuten;

    // Allow equal times (00:00 - 00:00 is valid)
    if (startTotalMinutes === endTotalMinutes) {
      return true;
    }

    // End time must be greater than start time
    return endTotalMinutes > startTotalMinutes;
  }

  /**
   * Parse German date format (DD.MM.YYYY) to Date object
   */
  parseGermanDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      console.error('parseGermanDate: dateString is null, undefined or not a string');
      return null;
    }

    const trimmedDate = dateString.trim();
    if (trimmedDate === '') {
      console.error('parseGermanDate: dateString is empty');
      return null;
    }

    const parts = trimmedDate.split('.');
    if (parts.length !== 3) {
      console.error('parseGermanDate: Invalid date format - expected DD.MM.YYYY, got:', dateString);
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error('parseGermanDate: Invalid date parts', { day, month, year, original: dateString });
      return null;
    }

    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
      console.error('parseGermanDate: Date out of reasonable range', { day, month, year });
      return null;
    }

    const date = new Date(year, month, day);

    if (isNaN(date.getTime())) {
      console.error('parseGermanDate: Invalid date object created', { day, month, year, result: date });
      return null;
    }

    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      console.error('parseGermanDate: Date normalization detected invalid date', {
        input: { day, month: month + 1, year },
        output: { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }
      });
      return null;
    }

    return date;
  }

  /**
   * Check for time overlaps with existing entries
   * Core overlap detection logic used by both validation methods
   */
  checkForTimeOverlaps(
    newStart: Date,
    newEnd: Date,
    treeData: TaetigkeitNode[],
    excludeEntryId?: string
  ): OverlapResult {
    const allTimeEntries: { entry: any; node: TaetigkeitNode }[] = [];

    const collectTimeEntries = (nodes: TaetigkeitNode[]) => {
      nodes.forEach(node => {
        if (node.stempelzeitData && node.formData) {
          allTimeEntries.push({ entry: node.stempelzeitData, node });
        }
        if (node.children) {
          collectTimeEntries(node.children);
        }
      });
    };

    collectTimeEntries(treeData);

    for (const { entry } of allTimeEntries) {
      if (excludeEntryId && entry.id === excludeEntryId) {
        continue;
      }

      const existingStart = new Date(entry.login);
      const existingEnd = new Date(entry.logoff);

      const isSameDay = existingStart.toDateString() === newStart.toDateString();
      if (!isSameDay) continue;

      // Check for overlap: two time ranges overlap if one starts before the other ends
      const hasOverlap = (newStart < existingEnd && newEnd > existingStart);
      if (hasOverlap) {
        const overlappingTime = `${this.formatTime(existingStart)} - ${this.formatTime(existingEnd)}`;
        return {
          hasOverlap: true,
          overlappingEntry: overlappingTime
        };
      }
    }

    return { hasOverlap: false };
  }

  /**
   * Format time as HH:MM
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}
