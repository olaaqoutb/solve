import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor() { }

  validateAllFields(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (!control) return;

      if ((control as any).controls) {
        this.validateAllFields(control as FormGroup);
      } else {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

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

  formatValidationErrors(errors: string[]): string {
    if (errors.length === 1) {
      return errors[0];
    }
    return 'Bitte korrigieren Sie folgende Fehler: ' + errors.slice(0, 3).join(', ');
  }
}
