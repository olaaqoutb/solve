import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { TaetigkeitFormData } from '../../models-2/TaetigkeitFormData';
import { FlatNode } from '../../models/Flat-node'; // Or appropriate model if in models-2
import { ApiStempelzeitEintragungsart } from '../../models-2/ApiStempelzeitEintragungsart';
import { ApiStempelzeit } from '../../models-2/ApiStempelzeit';
import { ApiTaetigkeitTyp } from '../../models-2/ApiTaetigkeitTyp';
import { ApiBuchungsart } from '../../models-2/ApiBuchungsart';
@Injectable({
  providedIn: 'root'
})
export class ActivityFormService {

  constructor(private fb: FormBuilder) {}

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


  createMonthForm(): FormGroup {
    return this.fb.group({
    abgeschlossen: [{ value: false, disabled: true }],
      gebuchtTotal: [{ value: '', disabled: true }],
      monthName: [{value:'',disabled: true }]
    });
  }


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


 populateActivityForm(form: FormGroup, formData: any): void {
  const datumValue = this.parseGermanDateForForm(formData.datum);
const taetigkeitValue = formData.taetigkeit
    ? (ApiTaetigkeitTyp as any)[formData.taetigkeit] || formData.taetigkeit
    : '';

  const buchungsartValue = formData.buchungsart
    ? (ApiBuchungsart as any)[formData.buchungsart] || formData.buchungsart
    : '';

  form.patchValue({
    datum: datumValue,
    buchungsart: buchungsartValue,
    produkt: formData.produkt?.kurzName || formData.produkt,
    produktposition: formData.produktposition?.produktPositionname || formData.produktposition,
    buchungspunkt: formData.buchungspunkt?.buchungspunkt || formData.buchungspunkt,
      taetigkeit: taetigkeitValue,
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


  populateMonthForm(form: FormGroup, node: FlatNode): void {
    form.patchValue({
      abgeschlossen: node.hasNotification || false,
      gebuchtTotal: node.gebuchtTotal || '',
      monthName: node.monthName || ''
    });
  }


  populateDayForm(form: FormGroup, node: FlatNode): void {
    form.patchValue({
      abgeschlossen: node.hasNotification || false,
      gestempelt: node.gestempelt || '',
      gebucht: node.gebucht || '',
      stempelzeiten: node.stempelzeitenList?.[0] || '',
      dayName: node.dayName || ''
    });
  }


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


  createStempelzeitData(loginDate: Date, logoffDate: Date, buchungsart: string) {
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


  createActivityData(
    formValue: any,
    gebuchtTime: string,
    isDurationBased: boolean = false
  ) {
    //  Calculate minutenDauer properly
    let minutenDauer: number;

    if (isDurationBased) {
      const durationHours = formValue.durationStunde || 0;
      const durationMinutes = formValue.durationMinuten || 0;
      minutenDauer = (durationHours * 60) + durationMinutes;
    } else {
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
      hasAlarm: isDurationBased
    };
  }

  private convertMinutenDauerToTimeString(minutenDauer: number): string {
    const hours = Math.floor(minutenDauer / 60);
    const minutes = minutenDauer % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }


  updateStempelzeitData(
    stempelzeitData: ApiStempelzeit,
    loginDate: Date,
    logoffDate: Date
  ): void {
    stempelzeitData.login = loginDate.toISOString();
    stempelzeitData.logoff = logoffDate.toISOString();
  }


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


  createUpdatedStempelzeitData(
    existingData: ApiStempelzeit,
    loginDate: Date,
    logoffDate: Date,
    buchungsart: string
  ) {
    return {
      id: existingData?.id || `moved-${Date.now()}`,
      // version: (existingData?.version || 0) + 1,
      deleted: false,
      login: loginDate.toISOString(),
      logoff: logoffDate.toISOString(),
      zeitTyp: buchungsart,
      poKorrektur: false,
      marker: existingData?.marker || [],
      // eintragungsart: existingData?.eintragungsart || 'NORMAL'
    };
  }


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
