import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class TimeUtilityService {

  constructor(private snackBar: MatSnackBar) {}

  calculateDuration(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
    return endMinutes > startMinutes;
  }

  adjustTime(
    currentHour: number,
    currentMinute: number,
    type: 'hour' | 'minute',
    amount: number,
    isHour24: boolean = false
  ): { hour: number, minute: number } {
    let newHour = currentHour;
    let newMinute = currentMinute;

    if (type === 'hour') {
      newHour += amount;
      if (newHour < 0) newHour = 24;
      if (newHour > 24) newHour = 0;
      if (newHour === 24) newMinute = 0;
    } else {
      // type === 'minute'
      if (isHour24) {
        newMinute = 0;
        this.snackBar.open('Bei 24 Stunden müssen die Minuten 0 bleiben', 'Schließen', { duration: 3000, verticalPosition: 'top' });
      } else {
        newMinute += amount;
        if (newMinute < 0) newMinute = 59;
        if (newMinute > 59) newMinute = 0;
      }
    }

    return { hour: newHour, minute: newMinute };
  }


  /**
   * Get month-year string from date (e.g., "Januar 2025")
   */
  getMonthYearString(date: Date): string {
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * Parse month-year string to date
   */
  parseMonthYearString(monthYear: string): Date {
    const monthNames: { [key: string]: number } = {
      'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
      'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
    };

    const parts = monthYear.split(' ');
    const month = monthNames[parts[0]];
    const year = parseInt(parts[1], 10);

    return new Date(year, month, 1);
  }

  /**
   * Format day name (e.g., "Mo. 15. Januar")
   */
  formatDayName(date: Date): string {
    const dayNames = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    return `${dayNames[date.getDay()]} ${date.getDate()}. ${monthNames[date.getMonth()]}`;
  }

  /**
   * Format time to HH:MM
   */
  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Calculate total time from array of login/logoff entries
   */
  calculateTotalTime(entries: Array<{ login: string, logoff: string }>): string {
    let totalMinutes = 0;

    entries.forEach(entry => {
      const login = new Date(entry.login);
      const logoff = new Date(entry.logoff);
      const diffMs = logoff.getTime() - login.getTime();
      totalMinutes += Math.floor(diffMs / (1000 * 60));
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate gestempelt/gebucht time from login and logoff dates
   * This is the duration between two timestamps in HH:MM format
   */
  calculateGestempelt(login: Date, logoff: Date): string {
    const diffMs = logoff.getTime() - login.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate gebucht time from duration hours and minutes
   * Used when you have duration instead of login/logoff times
   */
  calculateGebuchtFromDuration(durationHours: number, durationMinutes: number): string {
  return `${durationHours.toString().padStart(2, '0')}:${durationMinutes.toString().padStart(2, '0')}`;
}

  /**
   * Parse time string (HH:MM) to hours and minutes
   */
  parseTime(timeString: string): { hours: number, minutes: number } {
    const parts = timeString.split(':');
    return {
      hours: parseInt(parts[0], 10) || 0,
      minutes: parseInt(parts[1], 10) || 0
    };
  }

  /**
   * Convert hours and minutes to total minutes
   */
  toMinutes(hours: number, minutes: number): number {
    return hours * 60 + minutes;
  }

  /**
   * Convert total minutes to hours and minutes object
   */
  fromMinutes(totalMinutes: number): { hours: number, minutes: number } {
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    };
  }

  /**
   * Get hour value from form control
   */
  getHour(form: FormGroup, timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): number {
    let controlName: string;
    if (timeType === 'duration') {
      controlName = 'durationStunde';
    } else {
      controlName = timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
    }
    return form.get(controlName)?.value || 0;
  }

  /**
   * Get minute value from form control
   */
  getMinute(form: FormGroup, timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): number {
    let controlName: string;
    if (timeType === 'duration') {
      controlName = 'durationMinuten';
    } else {
      controlName = timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
    }
    return form.get(controlName)?.value || 0;
  }

  /**
   * Increase hour value
   */
  increaseHour(form: FormGroup, timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): void {
    const hourControlName = this.getHourControlName(timeType);
    const minuteControlName = this.getMinuteControlName(timeType);

    const currentHour = this.getHour(form, timeType);

    if (currentHour < 24) {
      const newHour = currentHour + 1;
      form.get(hourControlName)?.setValue(newHour);

      if (newHour === 24) {
        form.get(minuteControlName)?.setValue(0);
      }

      form.markAsDirty();
    }
  }

  /**
   * Decrease hour value
   */
  decreaseHour(form: FormGroup, timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): void {
    const controlName = this.getHourControlName(timeType);
    const currentHour = this.getHour(form, timeType);

    if (currentHour > 0) {
      form.get(controlName)?.setValue(currentHour - 1);
      form.markAsDirty();
    }
  }

  /**
   * Increase minute value
   */
  increaseMinute(form: FormGroup, timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): void {
    const controlName = this.getMinuteControlName(timeType);
    const currentMinute = this.getMinute(form, timeType);
    const currentHour = this.getHour(form, timeType);

    if (currentHour === 24) return;

    if (currentMinute < 59) {
      form.get(controlName)?.setValue(currentMinute + 1);
      form.markAsDirty();
    }
  }

  /**
   * Decrease minute value
   */
  decreaseMinute(form: FormGroup, timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): void {
    const controlName = this.getMinuteControlName(timeType);
    const currentMinute = this.getMinute(form, timeType);
    const currentHour = this.getHour(form, timeType);

    if (currentHour === 24) return;

    if (currentMinute > 0) {
      form.get(controlName)?.setValue(currentMinute - 1);
      form.markAsDirty();
    }
  }

  /**
   * Validate time input and enforce constraints
   */
  validateTime(form: FormGroup, timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): void {
    const hourControlName = this.getHourControlName(timeType);
    const minuteControlName = this.getMinuteControlName(timeType);

    const hourControl = form.get(hourControlName);
    const minuteControl = form.get(minuteControlName);

    let hourValue = hourControl?.value || 0;
    let minuteValue = minuteControl?.value || 0;

    // Enforce constraints
    if (hourValue < 0) hourValue = 0;
    if (hourValue > 24) hourValue = 24;

    if (minuteValue < 0) minuteValue = 0;
    if (minuteValue > 59) minuteValue = 59;

    // Special case: 24:00 is max, no 24:01
    if (hourValue === 24 && minuteValue !== 0) {
      minuteValue = 0;
    }

    hourControl?.setValue(hourValue);
    minuteControl?.setValue(minuteValue);

    form.markAsDirty();
  }

  /**
   * Get control name for hour based on time type
   */
  private getHourControlName(timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): string {
    if (timeType === 'duration') return 'durationStunde';
    return timeType === 'anmeldezeit' ? 'anmeldezeitStunde' : 'abmeldezeitStunde';
  }

  /**
   * Get control name for minute based on time type
   */
  private getMinuteControlName(timeType: 'anmeldezeit' | 'abmeldezeit' | 'duration'): string {
    if (timeType === 'duration') return 'durationMinuten';
    return timeType === 'anmeldezeit' ? 'anmeldezeitMinuten' : 'abmeldezeitMinuten';
  }
}
