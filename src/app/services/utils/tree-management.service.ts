import { Injectable } from '@angular/core';
import { TaetigkeitNode } from '../../models/TaetigkeitNode';
import { FlatNode } from '../../models/Flat-node';
import { TreeNodeService } from './tree-node.service';
import { TreeBuilderService } from './tree-builder.service';
import { TimeUtilityService } from './time-utility.service';
import { DateParserService } from './date-parser.service';
import { ApiProdukt } from '../../models-2/ApiProdukt';
import { ApiStempelzeit } from '../../models-2/ApiStempelzeit';
import { ApiProduktPosition } from '../../models-2/ApiProduktPosition';
import { ApiProduktPositionBuchungspunkt } from '../../models-2/ApiProduktPositionBuchungspunkt';
import { ApiAbschlussInfo } from '../../models-2/ApiAbschlussInfo';
import { ApiTaetigkeitsbuchung } from '../../models-2/ApiTaetigkeitsbuchung';
import { FlatTreeControl } from '@angular/cdk/tree';

@Injectable({
  providedIn: 'root'
})
export class TreeManagementService {

  constructor(
    private treeNodeService: TreeNodeService,
    private treeBuilderService: TreeBuilderService,
    private timeUtilityService: TimeUtilityService,
    private dateParserService: DateParserService
  ) { }

  /**
   * Add activity to tree and expand parents
   */
  addActivityToTree(
    treeData: TaetigkeitNode[],
    treeControl: FlatTreeControl<FlatNode>,
    date: Date,
    activityData: any,
    timeRange: string,
    stempelzeitData: ApiStempelzeit
  ): void {
    const monthYear = this.timeUtilityService.getMonthYearString(date);
    const monthNode = this.findOrCreateMonthNode(treeData, monthYear);
    const dayKey = this.timeUtilityService.formatDayName(date);
    const dayNode = this.findOrCreateDayNode(monthNode, dayKey, date);

    this.treeNodeService.addActivityToDay(dayNode, activityData, timeRange, stempelzeitData);
    this.treeBuilderService.expandParentNodesForNewEntry(treeControl, monthYear, dayKey);
  }

  /**
   * Find or create month node
   */
  private findOrCreateMonthNode(treeData: TaetigkeitNode[], monthYear: string): TaetigkeitNode {
    return this.treeNodeService.findOrCreateMonthNode(
      treeData,
      monthYear,
      (my) => this.timeUtilityService.parseMonthYearString(my)
    );
  }

  /**
   * Find or create day node
   */
  private findOrCreateDayNode(monthNode: TaetigkeitNode, dayKey: string, date: Date): TaetigkeitNode {
    return this.treeNodeService.findOrCreateDayNode(
      monthNode,
      dayKey,
      date,
      (dayStr) => this.dateParserService.getDateFromFormattedDay(dayStr)
    );
  }

  /**
   * Delete node from tree
   */
  deleteNodeFromTree(treeData: TaetigkeitNode[], selectedNode: FlatNode | null): boolean {
    return this.treeNodeService.deleteNodeFromTree(treeData, selectedNode);
  }

  /**
   * Find newly created node in tree
   */
  findNewlyCreatedNode(
    flatNodes: FlatNode[],
    formValue: any,
    timeRange: string
  ): FlatNode | undefined {
    return flatNodes.find(node =>
      node.level === 2 &&
      node.formData &&
      node.formData.datum === formValue.datum &&
      node.formData.produkt === formValue.produkt &&
      node.formData.produktposition === formValue.produktposition &&
      node.timeRange === timeRange
    );
  }


transformToTreeStructure(products: ApiProdukt[], stempelzeiten: ApiStempelzeit[], year: number,abschlussInfo?:ApiAbschlussInfo): TaetigkeitNode[] {
let closingDate: Date | null = null;

if (abschlussInfo?.naechsterBuchbarerTag) {
  closingDate = new Date(abschlussInfo.naechsterBuchbarerTag);
}

    const stempelzeitenMap = new Map<string, ApiStempelzeit>();
    const stempelzeitenByDay = new Map<string, ApiStempelzeit[]>();

    stempelzeiten.forEach(stempel => {
      if (!stempel.login) return;

      if (stempel.id) stempelzeitenMap.set(stempel.id, stempel);

      const loginDate = new Date(stempel.login);
      if (!isNaN(loginDate.getTime()) && loginDate.getFullYear() === year) {
        const dayKey = this.timeUtilityService.formatDayName(loginDate);
        if (!stempelzeitenByDay.has(dayKey)) {
          stempelzeitenByDay.set(dayKey, []);
        }
        stempelzeitenByDay.get(dayKey)?.push(stempel);
      }
    });

    // 2. Extract Activities
    const activitiesByDay: { [dayKey: string]: any[] } = {};
    const allDayKeys = new Set<string>();

    products.forEach(product => {
      if (!Array.isArray(product.produktPosition)) return;
      product.produktPosition.forEach((position: ApiProduktPosition) => {
        if (!Array.isArray(position.produktPositionBuchungspunkt)) return;
        position.produktPositionBuchungspunkt.forEach((punkt: ApiProduktPositionBuchungspunkt) => {
          if (!Array.isArray(punkt.taetigkeitsbuchung)) return;

          punkt.taetigkeitsbuchung.forEach((buchung: ApiTaetigkeitsbuchung) => {
            if ( !buchung.datum) return;

            const activityDate = new Date(buchung.datum);
            if (isNaN(activityDate.getTime()) || activityDate.getFullYear() !== year) return;

            const produktInfo = {
              produktKurzName: product.kurzName,
              produktname: product.produktname,
              positionName: position.produktPositionname,
              buchungspunkt: punkt.buchungspunkt,
              taetigkeit: buchung.taetigkeit,
              minutenDauer: buchung.minutenDauer || 0,
              anmerkung: buchung.anmerkung || '',
              jiraTicket: buchung.jiraTicket || '',
              buchungsart: buchung.buchungsart || 'BUCHUNG'
            };

            let linkedStempelzeit = null;
            if (buchung.stempelzeit && buchung.stempelzeit.id) {
              linkedStempelzeit = stempelzeitenMap.get(buchung.stempelzeit.id);
            }

            const activityObj = {
              type: linkedStempelzeit ? 'stempelzeit' : 'duration',
              data: linkedStempelzeit ? linkedStempelzeit : buchung,
              buchung: buchung,
              produktInfo: produktInfo
            };

            const dayKey = this.timeUtilityService.formatDayName(activityDate);
            allDayKeys.add(dayKey);

            if (!activitiesByDay[dayKey]) activitiesByDay[dayKey] = [];
            activitiesByDay[dayKey].push(activityObj);
          });
        });
      });
    });

    for (const dayKey of stempelzeitenByDay.keys()) {
      allDayKeys.add(dayKey);
    }

    const monthsMap: { [monthYear: string]: TaetigkeitNode } = {};
    const germanMonths = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    for (let month = 0; month < 12; month++) {
      const monthYear = `${germanMonths[month]} ${year}`;
      monthsMap[monthYear] = {
        name: monthYear,
        monthName: monthYear,
        gebuchtTotal: '00:00',
        hasNotification: false,
        children: []
      };
    }

    allDayKeys.forEach(dayKey => {
      const activities = activitiesByDay[dayKey] || [];
      const stamps = stempelzeitenByDay.get(dayKey) || [];
      let dateObj: Date | null = null;
      if (activities.length > 0) {
        const dStr = activities[0].type === 'stempelzeit' ? activities[0].data.login : activities[0].data.datum;
        if(dStr) dateObj = new Date(dStr);
      } else if (stamps.length > 0) {
        if(stamps[0].login) dateObj = new Date(stamps[0].login);
      }

      if (!dateObj || isNaN(dateObj.getTime())) return;

      const monthYear = this.timeUtilityService.getMonthYearString(dateObj);

   const dayNode: TaetigkeitNode = {
  name: dayKey,
  dayName: dayKey,
  gestempelt: '00:00',
  gebucht: '00:00',
  hasNotification: false,
  stempelzeitenList: [],
  children: [],
  dateKey: dateObj ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}` : undefined

};
if (activities.length === 0 && stamps.length === 0) return;

if (activities.length === 0) return;

let totalGebuchtMinutes = 0;
if (activities.length > 0) {
  if (stamps.length > 0) {
      dayNode.stempelzeitenList = this.treeNodeService.createStempelzeitenList(stamps);
    }
  activities.forEach(activity => {
    const activityNode = this.createActivityNodeFromBuchung(activity);
    dayNode.children!.push(activityNode);
    totalGebuchtMinutes += (activity.produktInfo.minutenDauer || 0);
  });

  dayNode.children!.sort((a, b) =>
    (a.productName || '').localeCompare(b.productName || '', 'de')
  );
}


      const gHours = Math.floor(totalGebuchtMinutes / 60);
      const gMins = totalGebuchtMinutes % 60;
      dayNode.gebucht = `${gHours.toString().padStart(2, '0')}:${gMins.toString().padStart(2, '0')}`;

      let totalGestempeltMinutes = 0;
      stamps.forEach(s => {
         if (s.login && s.logoff) {
            const l = new Date(s.login);
            const lo = new Date(s.logoff);
            const diff = Math.floor((lo.getTime() - l.getTime()) / 60000);
            totalGestempeltMinutes += diff > 0 ? diff : 0;
         }
      });
if (totalGestempeltMinutes === 0 && activities.length > 0) {
  activities.forEach(activity => {
    totalGestempeltMinutes += (activity.produktInfo.minutenDauer || 0);
  });
}
      const sHours = Math.floor(totalGestempeltMinutes / 60);
      const sMins = totalGestempeltMinutes % 60;
      dayNode.gestempelt = `${sHours.toString().padStart(2, '0')}:${sMins.toString().padStart(2, '0')}`;


      if (monthsMap[monthYear]) {
        monthsMap[monthYear].children!.push(dayNode);
      }
    });

 const treeData: TaetigkeitNode[] = [];
Object.values(monthsMap).forEach(monthNode => {

  // ← ADD THIS: skip months with no day children
  if (!monthNode.children || monthNode.children.length === 0) return;

  if (closingDate) {
    const monthDate = this.timeUtilityService.parseMonthYearString(monthNode.name || '');
    monthNode.hasNotification = monthDate < closingDate;
  }

  let mTotal = 0;
  monthNode.children?.forEach(d => {
    const [h, m] = (d.gebucht || "00:00").split(':').map(Number);
    mTotal += (h * 60) + m;
  });
  const mH = Math.floor(mTotal / 60);
  const mM = mTotal % 60;
  monthNode.gebuchtTotal = `${mH.toString().padStart(2,'0')}:${mM.toString().padStart(2,'0')}`;

  treeData.push(monthNode);
});

    treeData.sort((a, b) => {
       const dA = this.timeUtilityService.parseMonthYearString(a.name || '');
       const dB = this.timeUtilityService.parseMonthYearString(b.name || '');
       return dA.getTime() - dB.getTime();
    });

    return treeData;
  }
private createActivityNodeFromBuchung(activity: any): TaetigkeitNode {
  const produktInfo = activity.produktInfo;
  const buchung = activity.buchung;

  let loginTime: Date;
  let logoffTime: Date;
  let timeRange: string;
  let gestempelt: string;

  if (activity.type === 'stempelzeit') {
    loginTime = new Date(activity.data.login);
    logoffTime = new Date(activity.data.logoff);
    gestempelt = this.timeUtilityService.calculateGestempelt(loginTime, logoffTime);
    timeRange = `${this.timeUtilityService.formatTime(loginTime)} - ${this.timeUtilityService.formatTime(logoffTime)}`;
  } else {
    const datum = new Date(buchung.datum);
    loginTime = new Date(datum);
    loginTime.setHours(0, 0, 0, 0);

    const minutes = produktInfo.minutenDauer;
    logoffTime = new Date(loginTime.getTime() + minutes * 60000);

    timeRange = `Dauer: ${this.convertMinutesToTimeString(minutes)}`;
    gestempelt = '00:00';
  }

  const hours = Math.floor(produktInfo.minutenDauer / 60);
  const minutes = produktInfo.minutenDauer % 60;
  const gebucht = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return {
    name: `${produktInfo.produktname} ${produktInfo.positionName}`,
    productName: produktInfo.produktname,
    positionName: produktInfo.positionName,
    gebuchtTime: gebucht,
    timeRange: timeRange,
     buchungspunkt: produktInfo.buchungspunkt,
    stempelzeitData: activity.type === 'stempelzeit' ? activity.data : null,
    formData: {
      datum: this.dateParserService.formatToGermanDate(
        activity.type === 'stempelzeit' ? loginTime : new Date(buchung.datum)
      ),
      buchungsart: produktInfo.buchungsart,
      produkt: produktInfo.produktKurzName,
      produktposition: produktInfo.positionName,
      buchungspunkt: produktInfo.buchungspunkt,
      taetigkeit: produktInfo.taetigkeit,
      anmeldezeit: {
        stunde: loginTime.getHours(),
        minuten: loginTime.getMinutes()
      },
      abmeldezeit: {
        stunde: logoffTime.getHours(),
        minuten: logoffTime.getMinutes()
      },
      minutenDauer: produktInfo.minutenDauer,

      gestempelt: gestempelt,
      gebucht: gebucht,
      anmerkung: produktInfo.anmerkung,
      jiraTicket: produktInfo.jiraTicket
    }
  };
}

private convertMinutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

}
