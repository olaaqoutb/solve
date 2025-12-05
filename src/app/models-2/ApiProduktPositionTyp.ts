export enum ApiProduktPositionTyp {
  PROJEKT = "Projekt",
  KLEINPROJEKT = "Kleinprojekt",
  CHANGE_REQUEST = "Change Request",
  WARTUNG = "Wartung",
}

export function getApiProduktPositionTypDisplayValues(): { key: ApiProduktPositionTyp, value: string }[] {
  return [
    { key: ApiProduktPositionTyp.PROJEKT, value: "Projekt" },
    { key: ApiProduktPositionTyp.KLEINPROJEKT, value: "Kleinprojekt" },
    { key: ApiProduktPositionTyp.CHANGE_REQUEST, value: "Change Request" },
    { key: ApiProduktPositionTyp.WARTUNG, value: "Wartung" },
  ];
}
