export enum ApiProduktTyp {
  ANWENDUNG = "Anwendung",
  ADMINISTRATION = "Administration",
  ZENTRALE_KOMPONENTE = "zentrale Komponente",
}

export function getApiProduktTypDisplayValues(): { key: ApiProduktTyp, value: string }[] {
  return [
    { key: ApiProduktTyp.ANWENDUNG, value: "Anwendung" },
    { key: ApiProduktTyp.ADMINISTRATION, value: "Administration" },
    { key: ApiProduktTyp.ZENTRALE_KOMPONENTE, value: "zentrale Komponente" },
  ];
}
