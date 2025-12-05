export class AppConstants {

    static readonly BASE_URL: string = 'http://localhost:29200/at.gv.bmi.getit3-d/srv/v1';



    //static readonly BASE_URL: string = 'https://stportal.bmi.intra.gv.at/at.gv.bmi.getit3-e/gui/getitgui/proxy/v1';

    static readonly API_URL_PRODUKTE : string = AppConstants.BASE_URL + '/produkte';

    static readonly API_URL_VERTRAEGE: string = AppConstants.BASE_URL + '/vertraege';

    static readonly API_URL_PERSONEN_ANWESEND : string = AppConstants.BASE_URL + '/personen:anwesend';
 
    static readonly API_URL_ORGANISATION_EINHEITEN : string = AppConstants.BASE_URL + '/organisationseinheiten';

    static readonly API_URL_ANWESENHEITSLISTE_DETAIL : string = AppConstants.BASE_URL + '/stempelzeiten';

    static readonly API_URL_ABWESENHEIT : string = AppConstants.BASE_URL + '/stempelzeiten';

    static readonly API_URL_PERSONEN : string = AppConstants.BASE_URL + '/personen'; 

 }
