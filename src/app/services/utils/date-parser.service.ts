import { Injectable } from '@angular/core';
import { FlatNode } from '../../models/Flat-node';

@Injectable({
  providedIn: 'root'
})
export class DateParserService {

  private monthNames: { [key: string]: number } = {
    'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
    'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
  };

  /**
   * Parse formatted day string (e.g., "Montag 15. Januar") to Date
   */
  getDateFromFormattedDay(dayString: string): Date {
    const parts = dayString.split(/\s+/).filter(p => p);
    const dayNumber = parseInt(parts[1].replace('.', ''), 10);
    const monthName = parts[2];
    const month = this.monthNames[monthName] || 0;
    const year = new Date().getFullYear();
    return new Date(year, month, dayNumber);
  }

  /**
   * Parse German date format (DD.MM.YYYY) to Date
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
   * Format date to German locale string (DD.MM.YYYY)
   */
  formatToGermanDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  /**
   * Get current date as German formatted string
   */
  getCurrentDateGerman(): string {
    return this.formatToGermanDate(new Date());
  }


  getFullDayOfWeekFromNode(node: FlatNode | null): string {
    if (!node) return '';

    const sourceString = node.dayName || node.name || '';

    if (!sourceString) return '';

    // Pattern matches: "So." or "Mo." etc, then spaces, then day number, then ". ", then month name
    const dateMatch = sourceString.match(/(\w{2})\.\s+(\d{1,2})\.\s+(\w+)/);

    if (dateMatch) {
      const [, , day, monthName] = dateMatch;

      const monthMap: { [key: string]: number } = {
        'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
        'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
      };
      const month = monthMap[monthName];

      if (month !== undefined) {
        const year = new Date().getFullYear();
        const date = new Date(year, month, parseInt(day));

        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('de-DE', { weekday: 'long' });
        }
      }
    }
    return '';
  }
isStempelzeitenVisible(dateKey: string | undefined, naechsterBuchbarerTag: string | undefined): boolean {
  if (!naechsterBuchbarerTag || !dateKey) {
    return true;
  }

  const nodeDate = new Date(dateKey);
  const cutoffDate = new Date(naechsterBuchbarerTag);

  nodeDate.setHours(0, 0, 0, 0);
  cutoffDate.setHours(0, 0, 0, 0);

  return nodeDate >= cutoffDate;
}
}
