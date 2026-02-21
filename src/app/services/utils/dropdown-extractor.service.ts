import { Injectable } from '@angular/core';
import { ApiProdukt } from '../../models-2/ApiProdukt';
import { ApiProduktPositionBuchungspunkt } from '../../models-2/ApiProduktPositionBuchungspunkt';
import { ApiProduktPosition } from '../../models-2/ApiProduktPosition';



@Injectable({
  providedIn: 'root'
})
export class DropdownExtractorService {












////data comes from produkt-details as array of objects  but in the models Identified as objct
  extractDropdownOptions(products:ApiProdukt[]) {   ///////ApiProdukt
    const positionsSet = new Set<string>();
    const buchungspunkteSet = new Set<string>();

    products.forEach(product => {
      // console.log("lk",product.produktPosition);

      if (product.produktPosition) {
        product.produktPosition.forEach((position: ApiProduktPosition) => {  //////ApiProduktPosition
          if (position.produktPositionname) {
            positionsSet.add(position.produktPositionname);
          }

          if (position.produktPositionBuchungspunkt) {
            position.produktPositionBuchungspunkt.forEach((pb: ApiProduktPositionBuchungspunkt) => { ///////ApiProduktPositionBuchungspunkt
              if (pb.buchungspunkt) {
                buchungspunkteSet.add(pb.buchungspunkt);
              }
            });
          }
        });
      }

      console.log("here is your product info",products);
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

