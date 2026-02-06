import { Injectable } from '@angular/core';
import { TimeUtilityService } from './time-utility.service';
import { TreeNodeService } from './tree-node.service';
import{ TaetigkeitNode } from '../../models/TaetigkeitNode';

// export interface TaetigkeitNode {
//   name: string;
//   monthName?: string;
//   dayName?: string;
//   gestempelt?: string;
//   gebucht?: string;
//   hasEntries?: boolean;
//   hasNotification?: boolean;
//   children?: TaetigkeitNode[];
//   stempelzeitenList?: any[];
//   formData?: any;
// }

@Injectable({
  providedIn: 'root'
})
export class TreeBuilderService {

  constructor(
    private timeUtilityService: TimeUtilityService,
    private treeNodeService: TreeNodeService
  ) {}

  transformToTreeStructure(stempelzeiten: any[]): TaetigkeitNode[] {
    const groupedByMonth: { [key: string]: any[] } = {};

    stempelzeiten.forEach(entry => {
      const loginDate = new Date(entry.login);
      const monthYear = this.timeUtilityService.getMonthYearString(loginDate);
      if (!groupedByMonth[monthYear]) groupedByMonth[monthYear] = [];
      groupedByMonth[monthYear].push(entry);
    });

    const treeData: TaetigkeitNode[] = [];

    Object.keys(groupedByMonth).sort((a, b) => {
      const dateA = this.timeUtilityService.parseMonthYearString(a);
      const dateB = this.timeUtilityService.parseMonthYearString(b);
      return dateA.getTime() - dateB.getTime();
    }).forEach(monthYear => {
      const monthEntries = groupedByMonth[monthYear];
      const totalGebucht = this.timeUtilityService.calculateTotalTime(
        monthEntries.map(e => ({ login: e.login, logoff: e.logoff }))
      );

      const monthNode: TaetigkeitNode = {
        name: monthYear,
        monthName: monthYear,
        gebucht: totalGebucht,
        hasNotification: false,
        children: []
      };

      const firstEntry = monthEntries[0];
      const sampleDate = new Date(firstEntry.login);
      const year = sampleDate.getFullYear();
      const month = sampleDate.getMonth();

      const allDaysInMonth = this.generateAllDaysInMonth(year, month);

      const groupedByDay: { [key: string]: any[] } = {};
      monthEntries.forEach(entry => {
        const loginDate = new Date(entry.login);
        const dayKey = this.timeUtilityService.formatDayName(loginDate);
        if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
        groupedByDay[dayKey].push(entry);
      });

      allDaysInMonth.forEach(date => {
        const dayKey = this.timeUtilityService.formatDayName(date);
        const dayEntries = groupedByDay[dayKey] || [];
        const dayTotalTime = dayEntries.length > 0
          ? this.timeUtilityService.calculateTotalTime(
              dayEntries.map(e => ({ login: e.login, logoff: e.logoff }))
            )
          : '00:00';
        const stempelzeitenList = dayEntries.length > 0
          ? this.treeNodeService.createStempelzeitenList(dayEntries)
          : [];

        const dayNode: TaetigkeitNode = {
          name: dayKey,
          dayName: dayKey,
          gestempelt: dayTotalTime,
          gebucht: dayTotalTime,
          hasEntries: dayEntries.length > 0,
          stempelzeitenList,
          children: []
        };

        dayEntries.forEach(entry => {
          const loginTime = new Date(entry.login);
          const logoffTime = new Date(entry.logoff);
          const gestempelt = this.calculateGestempelt(loginTime, logoffTime);
          const timeRange = `${this.timeUtilityService.formatTime(loginTime)} - ${this.timeUtilityService.formatTime(logoffTime)}`;

          const activityNode: TaetigkeitNode = {
            name: `Bereitschaft ${timeRange}`,
            gebucht: gestempelt,
            timeRange,
            stempelzeitData: entry,
            formData: {
              startDatum: loginTime,
              startStunde: loginTime.getHours(),
              startMinuten: loginTime.getMinutes(),
              endeDatum: logoffTime,
              endeStunde: logoffTime.getHours(),
              endeMinuten: logoffTime.getMinutes(),
              anmerkung: entry.anmerkung || ''
            },
            children: []
          };

          dayNode.children?.push(activityNode);
        });

        monthNode.children?.push(dayNode);
      });

      treeData.push(monthNode);
    });

    return treeData;
  }

  private calculateGestempelt(start: Date, end: Date): string {
    const diff = (end.getTime() - start.getTime()) / 60000; // minutes
    const hours = Math.floor(diff / 60);
    const minutes = Math.floor(diff % 60);
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
  }

  private generateAllDaysInMonth(year: number, month: number): Date[] {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }
}
