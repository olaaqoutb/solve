import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor() { }

  /**
   * Mark all fields as touched and update validity
   */
  validateAllFields(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (!control) return;

      if ((control as FormGroup ).controls) {
        this.validateAllFields(control as FormGroup);
      } else {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  /**
   * Get validation errors from form
   */
  getValidationErrors(formGroup: FormGroup, fieldMap: {[key: string]: string}): string[] {
    const errors: string[] = [];
    const controls = formGroup.controls;

    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          const fieldName = fieldMap[key] || key;
          switch (errorKey) {
            case 'required':
              errors.push(`${fieldName} ist erforderlich`);
              break;
            case 'min':
              errors.push(`${fieldName} ist zu niedrig`);
              break;
            case 'max':
              errors.push(`${fieldName} ist zu hoch`);
              break;
            default:
              errors.push(`${fieldName} ist ungültig`);
          }
        });
      }
    });

    return errors;
  }

  /**
   * Format validation errors for display
   */
  formatValidationErrors(errors: string[]): string {
    if (errors.length === 1) {
      return errors[0];
    }
    return 'Bitte korrigieren Sie folgende Fehler: ' + errors.slice(0, 3).join(', ');
  }

  /**
   * Enable all form controls except specified ones
   */
  enableAllFormControls(formGroup: FormGroup, excludeFields: string[] = []): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!excludeFields.includes(key)) {
        formGroup.get(key)?.enable();
      }
    });
  }

  /**
   * Disable all form controls
   */
  disableAllFormControls(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.disable();
    });
  }

  /**
   * Enable specific form controls
   */
  enableFormControls(formGroup: FormGroup, fields: string[]): void {
    fields.forEach(field => {
      formGroup.get(field)?.enable();
    });
  }

  /**
   * Disable specific form controls
   */
  disableFormControls(formGroup: FormGroup, fields: string[]): void {
    fields.forEach(field => {
      formGroup.get(field)?.disable();
    });
  }
}
