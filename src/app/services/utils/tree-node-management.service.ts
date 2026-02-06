import { Injectable } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { TaetigkeitNode } from '../../models/TaetigkeitNode';
import { FlatNode } from '../../models/Flat-node';
@Injectable({
  providedIn: 'root'
})
export class TreeNodeManagementService {


  constructor() {}

  findOrCreateMonthNode(treeData: TaetigkeitNode[], monthYear: string, parseFn: (my: string) => Date): TaetigkeitNode {
    let monthNode = treeData.find(node => node.name === monthYear);
    if (!monthNode) {
      monthNode = {
        name: monthYear,
        monthName: monthYear,
        children: [],
        hasNotification: false
      } as TaetigkeitNode;
      treeData.push(monthNode);
    }
    return monthNode;
  }

  findOrCreateDayNode(monthNode: TaetigkeitNode, dayKey: string, date: Date, parseFn: (str: string) => Date): TaetigkeitNode {
    let dayNode = monthNode.children?.find(node => node.dayName === dayKey);
    if (!dayNode) {
      dayNode = {
        name: dayKey,
        dayName: dayKey,
        children: [],
        hasEntries: false
      } as TaetigkeitNode;
      monthNode.children?.push(dayNode);
    }
    return dayNode;
  }

  expandParentNodesForNewEntry(treeControl: FlatTreeControl<FlatNode>, monthYear: string, dayKey: string) {
    setTimeout(() => {
      const flatNodes = treeControl.dataNodes;

      const currentMonthNode = flatNodes.find(node => node.level === 0 && node.name === monthYear);
      if (currentMonthNode && !treeControl.isExpanded(currentMonthNode)) {
        treeControl.expand(currentMonthNode);
      }

      const currentDayNode = flatNodes.find(node => node.level === 1 && node.dayName === dayKey);
      if (currentDayNode && !treeControl.isExpanded(currentDayNode)) {
        treeControl.expand(currentDayNode);
      }
    }, 100);
  }

}
