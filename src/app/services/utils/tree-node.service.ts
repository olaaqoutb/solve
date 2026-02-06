import { Injectable } from '@angular/core';
import { TaetigkeitNode } from '../../models/TaetigkeitNode';
import { FlatNode } from '../../models/Flat-node';
import { TimeUtilityService } from './time-utility.service';

@Injectable({
  providedIn: 'root'
})
export class TreeNodeService {

  constructor(private timeUtilityService: TimeUtilityService) {}

  /**
   * Find or create a month node in the tree data
   */
  findOrCreateMonthNode(
    treeData: TaetigkeitNode[],
    monthYear: string,
    parseMonthYearFn: (monthYear: string) => Date
  ): TaetigkeitNode {
    let monthNode = treeData.find(node => node.name === monthYear);

    if (!monthNode) {
      monthNode = {
        name: monthYear,
        monthName: monthYear,
        gebuchtTotal: '00:00',
        hasNotification: false,
        children: [],
        hasAlarm: false,
        alarmData: null
      };

      treeData.push(monthNode);

      // Sort months by date (newest first)
      treeData.sort((a, b) => {
        const dateA = parseMonthYearFn(a.name || '');
        const dateB = parseMonthYearFn(b.name || '');
        return dateB.getTime() - dateA.getTime();
      });
    }

    return monthNode;
  }

  /**
   * Find or create a day node within a month node
   */
  findOrCreateDayNode(
    monthNode: TaetigkeitNode,
    dayKey: string,
    date: Date,
    getDateFromFormattedDayFn: (dayString: string) => Date
  ): TaetigkeitNode {
    if (!monthNode.children) {
      monthNode.children = [];
    }

    let dayNode = monthNode.children.find(node => node.dayName === dayKey);

    if (!dayNode) {
      dayNode = {
        name: dayKey,
        dayName: dayKey,
        gestempelt: '00:00',
        gebucht: '00:00',
        hasNotification: false,
        stempelzeitenList: [],
        children: [],
        hasAlarm: false,
        alarmData: null
      };

      monthNode.children.push(dayNode);

      // Sort days by date (newest first)
      monthNode.children.sort((a, b) => {
        const dateA = getDateFromFormattedDayFn(a.name || '');
        const dateB = getDateFromFormattedDayFn(b.name || '');
        return dateB.getTime() - dateA.getTime();
      });
    }

    return dayNode;
  }

  /**
   * Add an activity to a day node
   */
  addActivityToDay(
    dayNode: TaetigkeitNode,
    formData: any,
    timeRange: string,
    stempelzeitData?: any
  ): void {
    if (!dayNode.children) {
      dayNode.children = [];
    }

    const newChild: TaetigkeitNode = {
      name: `${formData.produkt || 'Unbenannt'} ${formData.produktposition || ''}`.trim(),
      productName: formData.produkt || 'Unbenannt',
      positionName: formData.produktposition || '',
      gebuchtTime: formData.gebucht,
      timeRange: timeRange,
      formData: formData,
      stempelzeitData: stempelzeitData,
      children: [],
      hasAlarm: false,
      alarmData: null
    };

    dayNode.children.push(newChild);
    this.updateParentTimes(dayNode);
  }

  /**
   * Update parent day node's total time based on children
   */
  updateParentTimes(dayNode: TaetigkeitNode): void {
    if (!dayNode.children || dayNode.children.length === 0) return;

    let totalMinutes = 0;
    dayNode.children.forEach(child => {
      if (child.formData) {
        const [hours, minutes] = (child.formData.gebucht || '00:00').split(':');
        totalMinutes += parseInt(hours) * 60 + parseInt(minutes);
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    dayNode.gebucht = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Remove a node from the tree
   */
  deleteNodeFromTree(
    treeData: TaetigkeitNode[],
    selectedNode: FlatNode | null
  ): boolean {
    if (!selectedNode) return false;

    const removeNode = (nodes: TaetigkeitNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        const treeNode = nodes[i];

        // For level 0 or 1 nodes, match by name
        if (selectedNode.level === 0 || selectedNode.level === 1) {
          if (treeNode.name === selectedNode.name) {
            nodes.splice(i, 1);
            return true;
          }
        }

        // For level 2 nodes, match by stempelzeit ID
        if (selectedNode.level === 2 && selectedNode.stempelzeitData) {
          if (treeNode.stempelzeitData?.id === selectedNode.stempelzeitData.id) {
            nodes.splice(i, 1);
            return true;
          }
        }

        if (treeNode.children && removeNode(treeNode.children)) {
          return true;
        }
      }
      return false;
    };

    return removeNode(treeData);
  }

  /**
   * Create a list of stempelzeiten strings for display
   * NOW USES INJECTED TimeUtilityService - NO CALLBACK NEEDED
   */
  createStempelzeitenList(entries: any[]): string[] {
    if (entries.length === 1) {
      const entry = entries[0];
      const loginTime = new Date(entry.login);
      const logoffTime = new Date(entry.logoff);
      const timeRange = `${this.timeUtilityService.formatTime(loginTime)} - ${this.timeUtilityService.formatTime(logoffTime)}`;
      return [`Stempelzeiten: ${timeRange}`];
    } else if (entries.length > 1) {
      const combinedTimeRanges = entries.map(entry => {
        const loginTime = new Date(entry.login);
        const logoffTime = new Date(entry.logoff);
        return `${this.timeUtilityService.formatTime(loginTime)} - ${this.timeUtilityService.formatTime(logoffTime)}`;
      }).join(', ');

      return [`Stempelzeiten: ${combinedTimeRanges}`];
    }

    return [];
  }

  /**
   * Map stempelzeiten to product information
   */
  mapStempelzeitenToProducts(products: any[]): Map<string, any> {
    const map = new Map<string, any>();

    products.forEach(product => {
      if (!product.produktPosition) return;

      product.produktPosition.forEach((position: any) => {
        if (!position.produktPositionBuchungspunkt) return;

        position.produktPositionBuchungspunkt.forEach((buchungspunkt: any) => {
          if (!buchungspunkt.taetigkeitsbuchung) return;

          buchungspunkt.taetigkeitsbuchung.forEach((taetigkeit: any) => {
            if (taetigkeit.stempelzeit && taetigkeit.stempelzeit.id) {
              map.set(taetigkeit.stempelzeit.id, {
                produktKurzName: product.kurzName,
                produktName: product.produktname,
                positionName: position.produktPositionname,
                buchungspunkt: buchungspunkt.buchungspunkt,
                taetigkeit: taetigkeit.taetigkeit
              });
            }
          });
        });
      });
    });

    return map;
  }



  recalculateDayTotals(dayNode: TaetigkeitNode): void {
  if (!dayNode.children || dayNode.children.length === 0) {
    dayNode.gestempelt = '00:00';
    dayNode.gebucht = '00:00';
    dayNode.hasEntries = false;
    return;
  }

  const ranges = dayNode.children
    .filter(c => c.stempelzeitData)
    .map(c => ({
      login: c.stempelzeitData.login,
      logoff: c.stempelzeitData.logoff
    }));

  const total = this.timeUtilityService.calculateTotalTime(ranges);

  dayNode.gestempelt = total;
  dayNode.gebucht = total;
  dayNode.hasEntries = true;
}
}

