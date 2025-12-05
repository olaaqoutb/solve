import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppUtilsService {

  constructor() { }


  public static getMitarbeiterart(mitarbeiterart : string){
    if(mitarbeiterart === 'EXTERN') return 'extern';
    if(mitarbeiterart === 'ZIVILDIENSTLEISTENDER') return 'Zivildienstleistender';
    if(mitarbeiterart === 'INTERN') return 'intern';
    if(mitarbeiterart === 'EXTERN_OHNE_BAKS') return 'extern ohne BAKS';


    // Roles
    if(mitarbeiterart === 'PROJECT_OFFICE') return 'ProjectOffice';
    if(mitarbeiterart === 'ADMIN_PROJECT_OFFICE') return 'Admin ProjectOffice';
    if(mitarbeiterart === 'DEFAULT') return 'Default';
    if(mitarbeiterart === 'PROJECT_OFFICE_READ_ONLY') return 'ProjectOffice Read Only';

    
    return 'Unbekannt - ' + mitarbeiterart;
  }
}
