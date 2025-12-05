import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(private snackBar: MatSnackBar) {}
  /**
   * Handle HTTP errors and return a user-friendly error message
   */
  handleError(error: HttpErrorResponse): string {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Fehler: ${error.error.message}`;
    } else {
      // Server-side error
      // Add more specific error messages based on status codes
      if (error.status === 404) {
        errorMessage = 'Die angeforderte Ressource wurde nicht gefunden.';
      } else if (error.status === 403) {
        errorMessage = 'Sie haben keine Berechtigung für diese Aktion.';
      } else if (error.status === 401) {
        errorMessage =
          'Sie sind nicht angemeldet oder Ihre Sitzung ist abgelaufen.';
      } else if (error.status === 400) {
        errorMessage = 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.';

        // Try to extract validation errors if available
        if (error.error && typeof error.error === 'object') {
          const validationErrors = this.extractValidationErrors(error.error);
          if (validationErrors) {
            errorMessage = validationErrors;
          }
        }
      } else if (error.status === 500) {
        errorMessage =
          'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      } else if (error.status === 0) {
        errorMessage =
          'Keine Verbindung zum Server möglich. Bitte überprüfen Sie Ihre Internetverbindung oder API-Konfiguration.';
      } else {
        errorMessage = `Fehler: ${error.status} - ${error.message}`;
      }
    }

    // Show error in snackbar for non-form errors with longer duration for network errors
    const duration = error.status === 0 ? 8000 : 5000;
    this.snackBar.open(errorMessage, 'Schließen', {
      duration: duration,
      panelClass: 'error-snackbar',
    });

    console.error('API Error:', error);
    return errorMessage;
  }

  /**
   * Extract validation errors from the error response
   */
  private extractValidationErrors(errorBody: any): string | null {
    if (!errorBody) return null;

    // Different APIs might format validation errors differently
    // Adapt this method based on your API's error format

    // Example 1: Spring Boot validation error format
    if (errorBody.errors && Array.isArray(errorBody.errors)) {
      return errorBody.errors
        .map((err: any) => err.defaultMessage || err.message)
        .join(', ');
    }

    // Example 2: Simple error messages object
    if (errorBody.message) {
      return errorBody.message;
    }

    // Example 3: Detailed field errors
    if (errorBody.fieldErrors && typeof errorBody.fieldErrors === 'object') {
      const fieldErrors: string[] = [];
      for (const field in errorBody.fieldErrors) {
        if (
          Object.prototype.hasOwnProperty.call(errorBody.fieldErrors, field)
        ) {
          fieldErrors.push(`${field}: ${errorBody.fieldErrors[field]}`);
        }
      }
      return fieldErrors.join(', ');
    }

    return null;
  }
}
