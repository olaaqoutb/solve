import { Injectable } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatNode } from '../../models/Flat-node';
import { TimeUtilityService } from './time-utility.service';
import { TaetigkeitNode } from '../../models/TaetigkeitNode';

@Injectable({
  providedIn: 'root'
})
export class TreeExpansionService {
  constructor(private timeUtilityService: TimeUtilityService) { }

  /**
   * Expand parent nodes for a newly created entry
   */
  expandParentNodesForNewEntry(
    treeControl: FlatTreeControl<FlatNode>,
    monthYear: string,
    dayKey: string,
    delayMs: number = 100
  ): void {
    setTimeout(() => {
      const flatNodes = treeControl.dataNodes;

      // Find and expand month node
      const monthNode = flatNodes.find(node =>
        node.level === 0 && node.name === monthYear
      );
      if (monthNode && !treeControl.isExpanded(monthNode)) {
        treeControl.expand(monthNode);
      }

      // Find and expand day node
      const dayNode = flatNodes.find(node =>
        node.level === 1 && node.dayName === dayKey
      );
      if (dayNode && !treeControl.isExpanded(dayNode)) {
        treeControl.expand(dayNode);
      }
    }, delayMs);
  }

  /**
   * Find a specific node in the tree
   */
  findNodeInTree(
    treeControl: FlatTreeControl<FlatNode>,
    predicate: (node: FlatNode) => boolean
  ): FlatNode | undefined {
    return treeControl.dataNodes.find(predicate);
  }

  /**
   * Find activity node by criteria
   */
  findActivityNode(
    treeControl: FlatTreeControl<FlatNode>,
    datum: string,
    produkt: string,
    produktposition: string,
    timeRange: string
  ): FlatNode | undefined {
    return this.findNodeInTree(treeControl, node =>
      node.level === 2 &&
      node.formData &&
      node.formData.datum === datum &&
      node.formData.produkt === produkt &&
      node.formData.produktposition === produktposition &&
      node.timeRange === timeRange
    );
  }
  expandCurrentAndLastMonth(treeControl: FlatTreeControl<any>): void {
   const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });

  setTimeout(() => {
    const allNodes = treeControl.dataNodes;

    const currentMonthNode = allNodes.find(
      node => node.level === 0 && node.monthName === currentMonthYear
    );

    if (currentMonthNode) {
      treeControl.expand(currentMonthNode);
    }
  }, 100);
}

private generateMonthNode(
  monthDate: Date,
  maxDay?: number
): TaetigkeitNode {

  const monthName = monthDate.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });

  const monthNode: TaetigkeitNode = {
    name: monthName,
    monthName: monthName,
    children: [],
    hasEntries: false
  };

  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  ).getDate();

  const lastDay = maxDay ?? daysInMonth;

  for (let day = 1; day <= lastDay; day++) {
    const dayDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      day
    );

    const dayKey = this.timeUtilityService.formatDayName(dayDate);

    const dayNode: TaetigkeitNode = {
      name: dayKey,
      dayName: dayKey,
      children: [],
      hasEntries: false,
      gestempelt: '00:00'
    };

    monthNode.children!.push(dayNode);
  }

  return monthNode;
}

generateCurrentAndPreviousMonth(): TaetigkeitNode[] {
  const today = new Date();

  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const tree: TaetigkeitNode[] = [];

  tree.push(this.generateMonthNode(previousMonth));

  tree.push(this.generateMonthNode(currentMonth, today.getDate()));

  return tree;
}


}
