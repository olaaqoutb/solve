import { NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
 override format(date: Date): string {
  const day = this.to2digit(date.getDate());
  const month = this.to2digit(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}


  private to2digit(n: number): string {
    return ('00' + n).slice(-2);
  }
  override parse(value: any): Date | null {
    if ((typeof value === 'string') && (value.indexOf('.') > -1)) {
      const str = value.split('.');
      const day = Number(str[0]);
      const month = Number(str[1]) - 1;
      const year = Number(str[2]);

      return new Date(year, month, day);
    }
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }
}
