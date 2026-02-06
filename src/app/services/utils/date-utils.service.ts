import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { format, min } from 'date-fns';
import { FlatNode } from '../../models/Flat-node';
@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {


  constructor(private datePipe: DatePipe) { }

  formatDate(date: string, format : string): string {
    const formatedDate = this.datePipe.transform(date, format, 'de-DE');
    if (formatedDate == null) {
      return '';
    }
    return formatedDate;
  }

  static getDateWithoutTime(date: string | Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }


  static  isDayEquals(d1: Date | null, d2: Date | null): boolean {
    if (d1 === null && d2 === null) {
      return true;
    } else if (d1 === null || d2 === null) {
      return false;
    }

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return formatDate(d1) === formatDate(d2);
  }


  static isMonthEquals(d1: Date | null, d2: Date | null): boolean {
    if (!d1 && !d2) {
      return true;
    } else if (!d1 || !d2) {
      return false;
    }

    const formatDate = (date: Date) => date.toISOString().slice(0, 7); // Extract "YYYY-MM"

    return formatDate(d1) === formatDate(d2);
  }

   formatEndAs24(date: Date | null, dateFormat: string): string | null {
    if (!date) {
        return null;
    }

    const formattedTime = format(date, 'HHmm'); // Get time in "HHmm" format

    if (formattedTime === '0000') {
        const lastDay = this.getLastDay(date);
        const hPos = dateFormat.indexOf('HH');
        let result = format(lastDay, dateFormat);
        result = result.substring(0, hPos) + '24' + result.substring(hPos + 2);
        return result;
    }

    return format(date, dateFormat);
  }

  getLastDay(date: Date): Date {
    const lastDay = new Date(date);
    lastDay.setDate(lastDay.getDate() - 1);
    return lastDay;
  }


  static formatDateToISO(date: Date, isBeginOfDay : boolean): string {
      const yyyy = date.getFullYear();
      const MM = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const dd = String(date.getDate()).padStart(2, '0');
      let hh = '00';
      let mm = '00'
      if(!isBeginOfDay){
        hh = '23';
        mm = '59';
      }
      // String(date.getHours()).padStart(2, '0');
      const ss ='00'; // String(date.getSeconds()).padStart(2, '0');
    //  const ms = String(date.getMilliseconds()).padStart(3, '0');

      return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;

  }


  static formatDateToISOFull(date: Date): string {

    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(date.getDate()).padStart(2, '0');
    let hh = String(date.getHours()).padStart(2, '0');
    let mm = String(date.getMinutes()).padStart(2, '0');

    const ss ='00';
    const ms = String(date.getMilliseconds()).padStart(3, '0');

    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${ms}`;

  }

  static formatDateAndTimeToISOFull(date: Date, hoursMinutes : string): string {
    console.log('formatDateAndTimeToISOFull-date', date);
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(date.getDate()).padStart(2, '0');

    const [hours, minutes] = hoursMinutes.split(':').map(Number);

    let hh = hours;
    let mm = minutes;


    const ss ='00';
    const ms = String(date.getMilliseconds()).padStart(3, '0');

    console.log('DATE', `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${ms}`);

     return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${ms}`;

  }

  static getMinutes(dateTimeString : string | undefined) : string{
    if(dateTimeString){
      const date = new Date(dateTimeString);
      const minutes = date.getMinutes();
      return minutes.toString();
    }else{
      return '';
    }

  }


  static getHours(dateTimeString : string | undefined) : string{
    if(dateTimeString){
      const date = new Date(dateTimeString);
      const hours = date.getHours();
      return hours.toString();
    }else{
      return '';
    }

  }



  getDateDisplayFromNode(node: FlatNode | null): string {
    if (!node) return '';

    const sourceString = node.dayName || node.name || '';
    if (!sourceString) return '';

    const dateMatch = sourceString.match(/(\w{2})\.\s+(\d{1,2})\.\s+(\w+)/);
    if (dateMatch) {
      const [, , day, monthName] = dateMatch;
      return `${day.padStart(2, '0')}. ${monthName}`;
    }
    return '';
  }


}
