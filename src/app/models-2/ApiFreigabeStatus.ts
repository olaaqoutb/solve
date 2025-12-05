export enum ApiFreigabeStatus {
  PRUEFEN_DV = "PruefenDV",
  PRUEFEN_EV = "PruefenEV",
  ABGELEHNT = "Abgelehnt",
  FREIGEGEBEN = "Freigegeben",
  FREIGEGEBEN_AUTO = "FreigegebenAuto",
}

export function getApiFreigabeStatusDisplayValues(): { key: ApiFreigabeStatus, value: string }[] {
  return [
    { key: ApiFreigabeStatus.PRUEFEN_DV, value: "PruefenDV" },
    { key: ApiFreigabeStatus.PRUEFEN_EV, value: "PruefenEV" },
    { key: ApiFreigabeStatus.ABGELEHNT, value: "Abgelehnt" },
    { key: ApiFreigabeStatus.FREIGEGEBEN, value: "Freigegeben" },
    { key: ApiFreigabeStatus.FREIGEGEBEN_AUTO, value: "FreigegebenAuto" },
  ];
}
