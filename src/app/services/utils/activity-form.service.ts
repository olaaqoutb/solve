import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { TaetigkeitFormData } from '../../models-2/TaetigkeitFormData';
import { FlatNode } from '../../models/Flat-node'; // Or appropriate model if in models-2
import { ApiStempelzeitEintragungsart } from '../../models-2/ApiStempelzeitEintragungsart';

@Injectable({
  providedIn: 'root'
})
export class ActivityFormService {

  constructor(private fb: FormBuilder) {}

  /**
   * Create main activity form
   */
  createActivityForm(): FormGroup {
    return this.fb.group({
      datum: [null, Validators.required],
      buchungsart: ['ARBEITSZEIT', Validators.required],
      produkt: [''],
      produktposition: [''],
      buchungspunkt: [''],
      taetigkeit: [''],
      anmeldezeitStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      anmeldezeitMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      abmeldezeitStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      abmeldezeitMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
       minutenDauer: [0, Validators.required],
      gestempelt: [{ value: '', disabled: true }],
      gebucht: [{ value: '', disabled: true }],
      anmerkung: [''],
      jiraTicket: ['']
    });
  }

  /**
   * Create alarm/duration form
   */
  createAlarmForm(): FormGroup {
    return this.fb.group({
      datum: [null, Validators.required],
      buchungsart: ['ARBEITSZEIT', Validators.required],
      produkt: [''],
      produktposition: [''],
      buchungspunkt: [''],
      taetigkeit: [''],
      durationStunde: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      durationMinuten: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      anmerkung: [''],
      jiraTicket: ['']
    });
  }

  /**
   * Create month summary form
   */
  createMonthForm(): FormGroup {
    return this.fb.group({
    abgeschlossen: [{ value: false, disabled: true }],
      gebuchtTotal: [{ value: '', disabled: true }],
      monthName: [{value:'',disabled: true }]
    });
  }

  /**
   * Create day summary form
   */
 createDayForm(): FormGroup {
  return this.fb.group({
    abgeschlossen: [{ value: false, disabled: true }],
    gestempelt: [{ value: '', disabled: true }],
    gebucht: [{ value: '', disabled: true }],
    stempelzeiten: [{ value: '', disabled: true }],
    dayName: [{ value: '', disabled: true }]
  });
}

setSummaryFormState(
  form: FormGroup,
  isEditable: boolean
): void {
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    if (!control) return;

    if (isEditable) {
      control.enable({ emitEvent: false });
    } else {
      control.disable({ emitEvent: false });
    }
  });
}

  /**
   * Populate activity form with data
   */
 populateActivityForm(form: FormGroup, formData: any): void {
  // Convert German date string to Date object for datepicker
  const datumValue = this.parseGermanDateForForm(formData.datum);

  form.patchValue({
    datum: datumValue,
    buchungsart: formData.buchungsart,
    produkt: formData.produkt,
    produktposition: formData.produktposition,
    buchungspunkt: formData.buchungspunkt,
    taetigkeit: formData.taetigkeit,
    anmeldezeitStunde: formData.anmeldezeit.stunde,
    anmeldezeitMinuten: formData.anmeldezeit.minuten,
    abmeldezeitStunde: formData.abmeldezeit.stunde,
    abmeldezeitMinuten: formData.abmeldezeit.minuten,
     minutenDauer: formData.minutenDauer || 0,
    gestempelt: formData.gestempelt,
    gebucht: formData.gebucht,
    anmerkung: formData.anmerkung,
    jiraTicket: formData.jiraTicket || ''
  });
}
private parseGermanDateForForm(dateString: string): Date | string {
  if (!dateString || typeof dateString !== 'string') {
    return dateString;
  }

  const parts = dateString.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return dateString;
}

  /**
   * Populate month form with data
   */
  populateMonthForm(form: FormGroup, node: FlatNode): void {
    form.patchValue({
      abgeschlossen: node.hasNotification || false,
      gebuchtTotal: node.gebuchtTotal || '',
      monthName: node.monthName || ''
    });
  }

  /**
   * Populate day form with data
   */
  populateDayForm(form: FormGroup, node: FlatNode): void {
    form.patchValue({
      abgeschlossen: node.hasNotification || false,
      gestempelt: node.gestempelt || '',
      gebucht: node.gebucht || '',
      stempelzeiten: node.stempelzeitenList?.[0] || '',
      dayName: node.dayName || ''
    });
  }

  /**
   * Initialize alarm form for a specific date
   */
  initializeAlarmForm(form: FormGroup, parentDate: Date): void {
    form.reset();
    form.patchValue({
      datum: parentDate,
      buchungsart: 'ARBEITSZEIT',
      produkt: '',
      produktposition: '',
      buchungspunkt: '',
      taetigkeit: '',
      durationStunde: 0,
      durationMinuten: 0,
      anmerkung: '',
      jiraTicket: ''
    });
  }

  /**
   * Initialize form for new entry
   */
  initializeNewEntryForm(form: FormGroup, currentDate: string): void {
    form.reset();
    form.patchValue({
      datum: currentDate,
      buchungsart: 'ARBEITSZEIT',
      produkt: '',
      produktposition: '',
      buchungspunkt: '',
      taetigkeit: '',
      anmeldezeitStunde: 0,
      anmeldezeitMinuten: 0,
      abmeldezeitStunde: 0,
      abmeldezeitMinuten: 0,
      anmerkung: '',
      jiraTicket: ''
    });
  }

  /**
   * Get default new entry node
   */
  getDefaultNewEntryNode(currentDate: string): FlatNode {
    return {
      level: 2,
      expandable: false,
      name: 'Neue Tätigkeit',
      hasNotification: false,
      formData: {
        datum: currentDate,
        buchungsart: 'ARBEITSZEIT',
        produkt: '',
        produktposition: '',
        buchungspunkt: '',
        taetigkeit: '',
        anmeldezeit: { stunde: 0, minuten: 0 },
        abmeldezeit: { stunde: 0, minuten: 0 },
        gestempelt: '00:00',
        gebucht: '00:00',
        anmerkung: '',
        jiraTicket: ''
      }
    };
  }
buildTimeRange(startHour: number, startMinute: number, endHour: number, endMinute: number): string {
    const start = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
    const end = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    return `${start} - ${end}`;
  }

  /**
   * Calculate gebucht time from start/end times
   */
  calculateGebuchtTime(
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): string {
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  /**
   * Create login and logoff date objects
   */
  createLoginLogoffDates(
    date: Date,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): { loginDate: Date; logoffDate: Date } {
    const loginDate = new Date(date);
    loginDate.setHours(startHour, startMinute, 0, 0);

    const logoffDate = new Date(date);
    logoffDate.setHours(endHour, endMinute, 0, 0);

    return { loginDate, logoffDate };
  }

  /**
   * Parse date from German format and create login/logoff dates
   */
  parseDateFromGermanFormat(
    germanDate: string,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): { loginDate: Date; logoffDate: Date } {
    const parts = germanDate.split('.');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const loginDate = new Date(year, month, day, startHour, startMinute);
    const logoffDate = new Date(year, month, day, endHour, endMinute);

    return { loginDate, logoffDate };
  }

  /**
   * Create stempelzeit data object
   */
  createStempelzeitData(loginDate: Date, logoffDate: Date, buchungsart: string): any {
    return {
      id: `new-${Date.now()}`,
      version: 1,
      deleted: false,
      login: loginDate.toISOString(),
      logoff: logoffDate.toISOString(),
      zeitTyp: buchungsart,
      poKorrektur: false,
      marker: [],
      eintragungsart: ApiStempelzeitEintragungsart.NORMAL
    };
  }

  /**
   * 🔥 UPDATED: Create activity data object from form values
   * Added isDurationBased parameter
   */
  createActivityData(
    formValue: any,
    gebuchtTime: string,
    isDurationBased: boolean = false
  ): any {
    // 🔥 Calculate minutenDauer properly
    let minutenDauer: number;

    if (isDurationBased) {
      // For alarm/duration entries: calculate from duration fields
      const durationHours = formValue.durationStunde || 0;
      const durationMinutes = formValue.durationMinuten || 0;
      minutenDauer = (durationHours * 60) + durationMinutes;
    } else {
      // For time-range entries: calculate from anmeldezeit/abmeldezeit
      const startMinutes = (formValue.anmeldezeitStunde || 0) * 60 + (formValue.anmeldezeitMinuten || 0);
      const endMinutes = (formValue.abmeldezeitStunde || 0) * 60 + (formValue.abmeldezeitMinuten || 0);
      minutenDauer = endMinutes - startMinutes;
    }

    return {
      datum: formValue.datum,
      buchungsart: formValue.buchungsart,
      produkt: formValue.produkt,
      produktposition: formValue.produktposition,
      buchungspunkt: formValue.buchungspunkt,
      taetigkeit: formValue.taetigkeit,
      anmeldezeit: {
        stunde: formValue.anmeldezeitStunde,
        minuten: formValue.anmeldezeitMinuten
      },
      abmeldezeit: {
        stunde: formValue.abmeldezeitStunde,
        minuten: formValue.abmeldezeitMinuten
      },
      minutenDauer: minutenDauer,
      gestempelt: gebuchtTime,
      gebucht: this.convertMinutenDauerToTimeString(minutenDauer),
      anmerkung: formValue.anmerkung || '',
      jiraTicket: formValue.jiraTicket || '',
      hasAlarm: isDurationBased  // 🔥 Mark if created from alarm (for UI display)
    };
  }

  private convertMinutenDauerToTimeString(minutenDauer: number): string {
    const hours = Math.floor(minutenDauer / 60);
    const minutes = minutenDauer % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Update existing node's stempelzeit data
   */
  updateStempelzeitData(
    stempelzeitData: any,
    loginDate: Date,
    logoffDate: Date
  ): void {
    stempelzeitData.login = loginDate.toISOString();
    stempelzeitData.logoff = logoffDate.toISOString();
  }

  /**
   * Update existing node's form data
   */
  updateFormData(formData: any, formValue: any): void {
    Object.assign(formData, {
      datum: formValue.datum,
      buchungsart: formValue.buchungsart,
      produkt: formValue.produkt,
      produktposition: formValue.produktposition,
      buchungspunkt: formValue.buchungspunkt,
      taetigkeit: formValue.taetigkeit,
      anmeldezeit: {
        stunde: formValue.anmeldezeitStunde,
        minuten: formValue.anmeldezeitMinuten
      },
      abmeldezeit: {
        stunde: formValue.abmeldezeitStunde,
        minuten: formValue.abmeldezeitMinuten
      },
      anmerkung: formValue.anmerkung,
      jiraTicket: formValue.jiraTicket
    });
  }

  /**
   * Create updated stempelzeit data for relocated entry
   */
  createUpdatedStempelzeitData(
    existingData: any,
    loginDate: Date,
    logoffDate: Date,
    buchungsart: string
  ): any {
    return {
      id: existingData?.id || `moved-${Date.now()}`,
      version: (existingData?.version || 0) + 1,
      deleted: false,
      login: loginDate.toISOString(),
      logoff: logoffDate.toISOString(),
      zeitTyp: buchungsart,
      poKorrektur: false,
      marker: existingData?.marker || [],
      eintragungsart: existingData?.eintragungsart || 'NORMAL'
    };
  }

  /**
   * Calculate duration end time from start time and duration
   */
  calculateDurationEndTime(
    startHour: number,
    startMinute: number,
    durationHours: number,
    durationMinutes: number
  ): { endHour: number; endMinute: number } {
    const totalMinutes = startMinute + durationMinutes;
    const totalHours = startHour + durationHours + Math.floor(totalMinutes / 60);
    const finalMinutes = totalMinutes % 60;

    const endHour = Math.min(totalHours, 24);
    const endMinute = endHour === 24 ? 0 : finalMinutes;

    return { endHour, endMinute };
  }

  /**
   * Get entry date string based on node level
   */
  getEntryDateString(node: FlatNode): string {
    if (node.level === 0) {
      return node.monthName || '';
    } else if (node.level === 1) {
      return node.dayName || '';
    } else if (node.level === 2 && node.formData) {
      return node.formData.datum;
    }
    return '';
  }
}
