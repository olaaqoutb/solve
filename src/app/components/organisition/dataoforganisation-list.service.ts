import { Injectable } from '@angular/core';
import { Datalistorganizationanc } from '../../models/datalistorganizationanc';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataoforganizationlistService {
  private datalistorganization: Datalistorganizationanc[] = [
  {
    "id": "1500000000040",
    "version": 1,
    "deleted": false,
    "bezeichnung": "IV/8/a",
    "kurzBezeichnung": "IV/8/a",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000042",
    "version": 1,
    "deleted": false,
    "bezeichnung": "IV/8/b",
    "kurzBezeichnung": "IV/8/b",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000014",
    "version": 3,
    "deleted": false,
    "bezeichnung": "IV/2/b - Zentraler IT-Betrieb",
    "kurzBezeichnung": "IV/2/b_ALT",
    "gueltigVon": "2005-12-01T00:00:00.000",
    "gueltigBis": "2020-11-10T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000024",
    "version": 2,
    "deleted": false,
    "bezeichnung": "IV/6",
    "kurzBezeichnung": "IV/6",
    "gueltigVon": "2001-01-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [],
    "parent": {
      "id": "1500000000022",
      "version": 12,
      "deleted": false,
      "bezeichnung": "BM.I auch noch länger",
      "kurzBezeichnung": "BM.I",
      "gueltigVon": "1971-01-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": []
    }
  },
  {
    "id": "1500000000038",
    "version": 8,
    "deleted": false,
    "bezeichnung": "IV/8",
    "kurzBezeichnung": "IV/8",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [],
    "leiter": {
      "id": "1500000000501",
      "vorname": "Gerdsch",
      "nachname": "Balluku",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "1500000000046",
      "version": 6,
      "deleted": false,
      "bezeichnung": "DDS-9 Langbezeichnung",
      "kurzBezeichnung": "DDS-9 ",
      "gueltigVon": "2016-07-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": [
        "a@c.at"
      ]
    }
  },
  {
    "id": "250300000001460",
    "version": 1,
    "deleted": false,
    "bezeichnung": "C-Test",
    "kurzBezeichnung": "C.I",
    "gueltigVon": "2023-11-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000036",
    "version": 4,
    "deleted": false,
    "bezeichnung": "IV/2/c Langbezeichnung",
    "kurzBezeichnung": "IV/2/c",
    "gueltigVon": "2016-08-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [
      "asdfas@sdfasd.sadf"
    ]
  },
  {
    "id": "1500000000026",
    "version": 7,
    "deleted": false,
    "bezeichnung": "IV/6/a",
    "kurzBezeichnung": "IV/6/a",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [],
    "parent": {
      "id": "1500000000022",
      "version": 12,
      "deleted": false,
      "bezeichnung": "BM.I auch noch länger",
      "kurzBezeichnung": "BM.I",
      "gueltigVon": "1971-01-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": []
    }
  },
  {
    "id": "1500000000012",
    "version": 3,
    "deleted": false,
    "bezeichnung": "IV/2/a - Anwendungsentwicklung und -bereitstellung",
    "kurzBezeichnung": "IV/2/a_ALT",
    "gueltigVon": "2005-12-01T00:00:00.000",
    "gueltigBis": "2020-11-10T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000002",
    "version": 2,
    "deleted": false,
    "bezeichnung": "IV/2/a - Strategie und Planung  (bis 01.12.2005)",
    "kurzBezeichnung": "IV/2/a (bis 01.12.2005)_ALT",
    "gueltigVon": "1970-01-01T00:00:00.000",
    "gueltigBis": "2005-11-30T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000004",
    "version": 2,
    "deleted": false,
    "bezeichnung": "IV/2/b - Rechenzentrum  (bis 01.12.2005)",
    "kurzBezeichnung": "IV/2/b (bis 01.12.2005)_ALT",
    "gueltigVon": "1970-01-01T00:00:00.000",
    "gueltigBis": "2005-11-30T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000016",
    "version": 3,
    "deleted": false,
    "bezeichnung": "IV/2/c - Benutzerservices",
    "kurzBezeichnung": "IV/2/c_ALT",
    "gueltigVon": "2005-12-01T00:00:00.000",
    "gueltigBis": "2020-11-10T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000006",
    "version": 2,
    "deleted": false,
    "bezeichnung": "IV/2/c - Informationsstruktur und Kommunikationssysteme (bis 01.12.2005)",
    "kurzBezeichnung": "IV/2/c (bis 01.12.2005)_ALT",
    "gueltigVon": "1970-01-01T00:00:00.000",
    "gueltigBis": "2005-11-30T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000008",
    "version": 2,
    "deleted": false,
    "bezeichnung": "IV/2/d - Benutzerservice  (bis 01.12.2005)",
    "kurzBezeichnung": "IV/2/d (bis 01.12.2005)_ALT",
    "gueltigVon": "1970-01-01T00:00:00.000",
    "gueltigBis": "2005-11-30T00:00:00.000",
    "email": []
  },
  {
    "id": "247500000000202",
    "version": 2,
    "deleted": false,
    "bezeichnung": "DDS-99 Testorganisation",
    "kurzBezeichnung": "DDS-99",
    "gueltigVon": "2023-11-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [
      "walter.hofstetter@bmi.gv.at"
    ],
    "leiter": {
      "id": "1500000000579",
      "titel": "Ing.",
      "vorname": "Peter Franz",
      "nachname": "Thiem",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "1500000000022",
      "version": 12,
      "deleted": false,
      "bezeichnung": "BM.I auch noch länger",
      "kurzBezeichnung": "BM.I",
      "gueltigVon": "1971-01-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": []
    }
  },
  {
    "id": "1500000000034",
    "version": 13,
    "deleted": false,
    "bezeichnung": "IV/2/b",
    "kurzBezeichnung": "IV/2/b",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [
      "asdfsaf@asdfjasf.sf"
    ],
    "leiter": {
      "id": "1500000000579",
      "titel": "Ing.",
      "vorname": "Peter Franz",
      "nachname": "Thiem",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "1500000000030",
      "version": 8,
      "deleted": false,
      "bezeichnung": "IV/2",
      "kurzBezeichnung": "IV/2",
      "gueltigVon": "2016-07-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": [
        "test_iv2@bmi.gv.at"
      ]
    }
  },
  {
    "id": "1500000000020",
    "version": 6,
    "deleted": false,
    "bezeichnung": "extern",
    "kurzBezeichnung": "extern",
    "gueltigVon": "1970-01-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000046",
    "version": 6,
    "deleted": false,
    "bezeichnung": "DDS-9 Langbezeichnung",
    "kurzBezeichnung": "DDS-9 ",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [
      "a@c.at"
    ],
    "leiter": {
      "id": "1500000000419",
      "vorname": "Richard",
      "nachname": "Mayrhofer",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "1500000000022",
      "version": 12,
      "deleted": false,
      "bezeichnung": "BM.I auch noch länger",
      "kurzBezeichnung": "BM.I",
      "gueltigVon": "1971-01-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": []
    }
  },
  {
    "id": "1500000000022",
    "version": 12,
    "deleted": false,
    "bezeichnung": "BM.I auch noch länger",
    "kurzBezeichnung": "BM.I",
    "gueltigVon": "1971-01-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000010",
    "version": 3,
    "deleted": false,
    "bezeichnung": "IV/2/ex - Nationale und internationale IT - Koordination (bis 01.12.2005)",
    "kurzBezeichnung": "IV/2/ex (bis 01.12.2005)_ALT",
    "gueltigVon": "1970-01-01T00:00:00.000",
    "gueltigBis": "2005-11-30T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000018",
    "version": 5,
    "deleted": false,
    "bezeichnung": "IV/2/d - Registerservices sowie KIT-Budget",
    "kurzBezeichnung": "IV/2/d",
    "gueltigVon": "2005-12-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [
      "test_iv2d@a.at"
    ],
    "leiter": {
      "id": "1500000000059",
      "vorname": "David",
      "nachname": "Berghuber",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "1500000000032",
      "version": 9,
      "deleted": false,
      "bezeichnung": "IV/2/a",
      "kurzBezeichnung": "IV/2/a",
      "gueltigVon": "2016-07-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": [
        "walter.hofstetter@bmi.gv.at"
      ]
    }
  },
  {
    "id": "1500000000030",
    "version": 8,
    "deleted": false,
    "bezeichnung": "IV/2",
    "kurzBezeichnung": "IV/2",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [
      "test_iv2@bmi.gv.at"
    ],
    "leiter": {
      "id": "1500000000579",
      "titel": "Ing.",
      "vorname": "Peter Franz",
      "nachname": "Thiem",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "1500000000022",
      "version": 12,
      "deleted": false,
      "bezeichnung": "BM.I auch noch länger",
      "kurzBezeichnung": "BM.I",
      "gueltigVon": "1971-01-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": []
    }
  },
  {
    "id": "1500000000028",
    "version": 7,
    "deleted": false,
    "bezeichnung": "IV/6/b",
    "kurzBezeichnung": "IV/6/b",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [],
    "leiter": {
      "id": "15700000004204",
      "vorname": "Richard",
      "nachname": "Buchner",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "1500000000024",
      "version": 2,
      "deleted": false,
      "bezeichnung": "IV/6",
      "kurzBezeichnung": "IV/6",
      "gueltigVon": "2001-01-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": []
    }
  },
  {
    "id": "1500000000044",
    "version": 15,
    "deleted": false,
    "bezeichnung": "IV/8/c",
    "kurzBezeichnung": "IV/8/c",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [],
    "leiter": {
      "id": "14600000009737",
      "vorname": "Heino",
      "nachname": "Zunzer",
      "recht": [],
      "funktion": [],
      "vertrag": []
    }
  },
  {
    "id": "1500000000048",
    "version": 5,
    "deleted": false,
    "bezeichnung": "IV/B länger",
    "kurzBezeichnung": "IV/B lang",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": []
  },
  {
    "id": "1500000000032",
    "version": 9,
    "deleted": false,
    "bezeichnung": "IV/2/a",
    "kurzBezeichnung": "IV/2/a",
    "gueltigVon": "2016-07-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [
      "walter.hofstetter@bmi.gv.at"
    ],
    "leiter": {
      "id": "213100000000057",
      "vorname": "Person",
      "nachname": "Demo",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "1500000000030",
      "version": 8,
      "deleted": false,
      "bezeichnung": "IV/2",
      "kurzBezeichnung": "IV/2",
      "gueltigVon": "2016-07-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": [
        "test_iv2@bmi.gv.at"
      ]
    }
  },
  {
    "id": "252900000000017",
    "version": 5,
    "deleted": true,
    "bezeichnung": "IV/1/Test",
    "kurzBezeichnung": "IV/1/Test Neueintrag",
    "gueltigVon": "2023-12-01T00:00:00.000",
    "gueltigBis": "9999-12-31T00:00:00.000",
    "email": [
      "jdh@jhmfk.kk"
    ],
    "leiter": {
      "id": "343200000000078",
      "vorname": "Hassan",
      "nachname": "Terab",
      "recht": [],
      "funktion": [],
      "vertrag": []
    },
    "parent": {
      "id": "247500000000202",
      "version": 2,
      "deleted": false,
      "bezeichnung": "DDS-99 Testorganisation",
      "kurzBezeichnung": "DDS-99",
      "gueltigVon": "2023-11-01T00:00:00.000",
      "gueltigBis": "9999-12-31T00:00:00.000",
      "email": [
        "walter.hofstetter@bmi.gv.at"
      ]
    }
  }
]
  constructor() { }
   
  getMitarbeiterList(): Observable<Datalistorganizationanc[]> {
    return of(this.datalistorganization);
  }

  getActiveData(): Datalistorganizationanc[] {
    console.log("deleted")
    return this.datalistorganization.filter(item => !item.deleted);
  }

  getAllData(): Datalistorganizationanc[] {
    return this.datalistorganization;
  }
  // تحديث مؤسسة موجودة
updateOrganization(updated: Datalistorganizationanc): void {
  const index = this.datalistorganization.findIndex(org => org.id === updated.id);
  if (index !== -1) {
    this.datalistorganization[index] = { ...this.datalistorganization[index], ...updated };
  }
}

// إضافة مؤسسة جديدة
addOrganization(newOrg: Datalistorganizationanc): void {
  this.datalistorganization.push(newOrg);
}

}
