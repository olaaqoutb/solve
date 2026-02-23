import { Injectable } from '@angular/core';
import { ApiProdukt } from '../../models-2/ApiProdukt';
import { ApiProduktPositionBuchungspunkt } from '../../models-2/ApiProduktPositionBuchungspunkt';
import { ApiProduktPosition } from '../../models-2/ApiProduktPosition';



@Injectable({
  providedIn: 'root'
})
export class DropdownExtractorService {

extractDropdownOptions(products: ApiProdukt[]) {
  const positionsMap = new Map<string, ApiProduktPosition>();
  const buchungspunkteMap = new Map<string, ApiProduktPositionBuchungspunkt>();

  products.forEach(product => {
    if (product.produktPosition) {
      product.produktPosition.forEach((position: ApiProduktPosition) => {
        if (position.produktPositionname) {
          positionsMap.set(position.produktPositionname, position);
        }

        if (position.produktPositionBuchungspunkt) {
          position.produktPositionBuchungspunkt.forEach((pb: ApiProduktPositionBuchungspunkt) => {
            if (pb.buchungspunkt) {
              buchungspunkteMap.set(pb.buchungspunkt, pb);
            }
          });
        }
      });
    }
  });

  return {
    produktpositionOptions: Array.from(positionsMap.values()),
    buchungspunktOptions: Array.from(buchungspunkteMap.values())
  };
}
}

