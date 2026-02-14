import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly DURATION_SHORT = 3000;
  private readonly DURATION_LONG = 5000;

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show success message (short duration)
   */
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Schließen', {
      duration: this.DURATION_SHORT,
      verticalPosition: 'top'
    });
  }

  /**
   * Show error message (long duration)
   */
  showError(message: string): void {
    this.snackBar.open(message, 'Schließen', {
      duration: this.DURATION_LONG,
      verticalPosition: 'top'
    });
  }

  /**
   * Show info message (short duration)
   */
  showInfo(message: string): void {
    this.snackBar.open(message, 'Schließen', {
      duration: this.DURATION_SHORT,
      verticalPosition: 'top'
    });
  }

  /**
   * Show message with custom duration
   */
  showMessage(message: string, duration?: number): void {
    this.snackBar.open(message, 'Schließen', {
      duration: duration || this.DURATION_SHORT,
      verticalPosition: 'top'
    });
  }

  /**
   * Show validation errors
   */
  showValidationErrors(errors: string[]): void {
    if (errors.length === 1) {
      this.showError(errors[0]);
    } else {
      const message = 'Bitte korrigieren Sie folgende Fehler: ' + errors.slice(0, 3).join(', ');
      this.showError(message);
    }
  }

  // Common messages
  saved(): void {
    this.showSuccess('Änderungen gespeichert!');
  }

  deleted(): void {
    this.showSuccess('Eintrag gelöscht!');
  }

  created(): void {
    this.showSuccess('Neue Tätigkeit erfolgreich erstellt!');
  }

  invalidTime(): void {
    this.showError('Ungültige Zeitangaben');
  }

  invalidDuration(): void {
    this.showError('Bitte geben Sie eine gültige Dauer ein');
  }

  invalidDate(): void {
    this.showError('Ungültiges Datumformat');
  }

  fillRequired(): void {
    this.showError('Bitte füllen Sie alle erforderlichen Felder aus');
  }

  monthSaved(): void {
    this.showSuccess('Monatsänderungen gespeichert!');
  }

  daySaved(): void {
    this.showSuccess('Tagesänderungen gespeichert!');
  }
}
