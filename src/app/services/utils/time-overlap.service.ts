import { Injectable } from '@angular/core';
import { TaetigkeitNode } from '../../models/TaetigkeitNode';
import { ApiStempelzeit } from '../../models-2/ApiStempelzeit';

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


  validateBereitschaftEntry(
    formValue: any,
    treeData: TaetigkeitNode[],
    excludeEntryId?: string
  ): CompleteValidationResult {
    const startDate = this.parseGermanDate(formValue.startDatum);
    const endDate = this.parseGermanDate(formValue.endeDatum);

    if (!startDate || !endDate) {
      return {
        isValid: false,
        errorMessage: 'Ungültiges Datumformat. Bitte verwenden Sie TT.MM.JJJJ'
      };
    }


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


    const loginDate = new Date(startDate);
    loginDate.setHours(formValue.startStunde, formValue.startMinuten, 0, 0);
    const logoffDate = new Date(endDate);
    logoffDate.setHours(formValue.endeStunde, formValue.endeMinuten, 0, 0);


    if (logoffDate <= loginDate) {
      return {
        isValid: false,
        errorMessage: 'Ende-Zeitpunkt muss nach Start-Zeitpunkt liegen'
      };
    }


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


  validateTimeEntryOverlap(
    formValue: any,
    treeData: TaetigkeitNode[],
    excludeEntryId?: string,
    isDurationBased: boolean = false
  ): TimeValidationResult {
    const {
      datum,
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    if (!datum) {
      return {
        isValid: false,
        errorMessage: 'Datum ist erforderlich'
      };
    }

    const selectedDate = this.parseGermanDate(datum);
    if (!selectedDate) {
      return {
        isValid: false,
        errorMessage: 'Ungültiges Datumformat. Bitte verwenden Sie TT.MM.JJJJ'
      };
    }

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


  isTimeValid(formValue: any): boolean {
    const {
      anmeldezeitStunde, anmeldezeitMinuten,
      abmeldezeitStunde, abmeldezeitMinuten
    } = formValue;

    if (anmeldezeitStunde < 0 || anmeldezeitStunde > 24 ||
        abmeldezeitStunde < 0 || abmeldezeitStunde > 24 ||
        anmeldezeitMinuten < 0 || anmeldezeitMinuten > 59 ||
        abmeldezeitMinuten < 0 || abmeldezeitMinuten > 59) {
      return false;
    }

    if ((anmeldezeitStunde === 24 && anmeldezeitMinuten !== 0) ||
        (abmeldezeitStunde === 24 && abmeldezeitMinuten !== 0)) {
      return false;
    }

    const startTotalMinutes = anmeldezeitStunde * 60 + anmeldezeitMinuten;
    const endTotalMinutes = abmeldezeitStunde * 60 + abmeldezeitMinuten;

    if (startTotalMinutes === endTotalMinutes) {
      return false;
    }

    return endTotalMinutes > startTotalMinutes;
  }


  parseGermanDate(dateInput: string | Date): Date | null {
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) {
        return null;
      }
      const normalizedDate = new Date(dateInput);
      normalizedDate.setHours(0, 0, 0, 0);
      return normalizedDate;
    }

    if (!dateInput || typeof dateInput !== 'string') {
      return null;
    }

    const trimmedDate = dateInput.trim();
    if (trimmedDate === '') {
      return null;
    }

    const parts = trimmedDate.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null;
    }

    const date = new Date(year, month, day);


    date.setHours(0, 0, 0, 0);

    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  }


  checkForTimeOverlaps(
    newStart: Date,
    newEnd: Date,
    treeData: TaetigkeitNode[],
    excludeEntryId?: string
  ): OverlapResult {

    const allTimeEntries: { entry: ApiStempelzeit; node: TaetigkeitNode }[] = [];

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

    const newStartDate = new Date(newStart);
    newStartDate.setHours(0, 0, 0, 0);

    for (const { entry } of allTimeEntries) {

      if (excludeEntryId && entry.id === excludeEntryId) {
        continue;
      }

      if (!entry.login || !entry.logoff) {
        continue;
      }

      const existingStart = new Date(entry.login);
      const existingEnd = new Date(entry.logoff);
      const existingStartDate = new Date(existingStart);
      existingStartDate.setHours(0, 0, 0, 0);
      const isSameDay = existingStartDate.getTime() === newStartDate.getTime();

      if (!isSameDay) {
        continue;
      }

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

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}
