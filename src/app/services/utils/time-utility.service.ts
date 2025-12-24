import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeUtilityService {

  constructor() { }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  calculateDuration(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  calculateTotalTime(entries: Array<{login: string, logoff: string}>): string {
    let totalMinutes = 0;
    entries.forEach(entry => {
      const login = new Date(entry.login);
      const logoff = new Date(entry.logoff);
      const duration = (logoff.getTime() - login.getTime()) / (1000 * 60);
      totalMinutes += duration;
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  parseMonthYearString(monthYear: string): Date {
    const months: { [key: string]: number } = {
      'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3,
      'Mai': 4, 'Juni': 5, 'Juli': 6, 'August': 7,
      'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
    };
    const parts = monthYear.replace('[abgeschlossen]', '').trim().split(' ');
    const [monthName, year] = parts;
    const month = months[monthName];
    return new Date(parseInt(year), month, 1);
  }

  getMonthYearString(date: Date): string {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  formatDayName(date: Date): string {
    const weekdays: { [key: number]: string } = {
      0: 'So.', 1: 'Mo.', 2: 'Di.', 3: 'Mi.',
      4: 'Do.', 5: 'Fr.', 6: 'Sa.'
    };
    const weekday = weekdays[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('de-DE', { month: 'long' });
    return `${weekday}  ${day}. ${month}`;
  }

  isTimeValid(start: {hour: number, minute: number}, end: {hour: number, minute: number}): boolean {
    // Hour 24 validation
    if ((start.hour === 24 && start.minute !== 0) ||
        (end.hour === 24 && end.minute !== 0)) {
      return false;
    }

    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;

    // Allow equal times or end > start
    return endMinutes >= startMinutes;
  }
}
