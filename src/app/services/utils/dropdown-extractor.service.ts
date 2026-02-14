import { Injectable } from '@angular/core';

// export interface DropdownOptions {
//   produktpositionOptions: any[];
//   buchungspunktOptions: any[];
// }

@Injectable({
  providedIn: 'root'
})
export class DropdownExtractorService {

  /**
   * Extract unique produktposition and buchungspunkt options from products
   */
  extractDropdownOptions(products: any[]): any {
    const positionsSet = new Set<string>();
    const buchungspunkteSet = new Set<string>();

    products.forEach(product => {
      if (product.produktPosition) {
        product.produktPosition.forEach((position: any) => {
          if (position.produktPositionname) {
            positionsSet.add(position.produktPositionname);
          }

          if (position.produktPositionBuchungspunkt) {
            position.produktPositionBuchungspunkt.forEach((bp: any) => {
              if (bp.buchungspunkt) {
                buchungspunkteSet.add(bp.buchungspunkt);
              }
            });
          }
        });
      }
    });

    return {
      produktpositionOptions: Array.from(positionsSet).map(name => ({
        produktPositionname: name
      })),
      buchungspunktOptions: Array.from(buchungspunkteSet).map(name => ({
        buchungspunkt: name
      }))
    };
  }
}

