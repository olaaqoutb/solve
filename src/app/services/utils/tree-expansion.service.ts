import { Injectable } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatNode } from '../../models/Flat-node';

@Injectable({
  providedIn: 'root'
})
export class TreeExpansionService {

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
}
