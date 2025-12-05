export enum ApiAuswertungsart {
  ALLE = "Alle",
  DV = "DV",
  EV = "EV",
  PV = "PV",
  TL = "TL",
  EIGENE = "Eigene",
}

export function getApiAuswertungsartDisplayValues(): { key: ApiAuswertungsart, value: string }[] {
  return [
    { key: ApiAuswertungsart.ALLE, value: "Alle" },
    { key: ApiAuswertungsart.DV, value: "DV" },
    { key: ApiAuswertungsart.EV, value: "EV" },
    { key: ApiAuswertungsart.PV, value: "PV" },
    { key: ApiAuswertungsart.TL, value: "TL" },
    { key: ApiAuswertungsart.EIGENE, value: "Eigene" },
  ];
}
