export enum ApiFreigabePositionFunktion {
  DV = "DV",
  EV = "EV",
  PO = "PO",
  AL = "AL",
}

export function getApiFreigabePositionFunktionDisplayValues(): { key: ApiFreigabePositionFunktion, value: string }[] {
  return [
    { key: ApiFreigabePositionFunktion.DV, value: "DV" },
    { key: ApiFreigabePositionFunktion.EV, value: "EV" },
    { key: ApiFreigabePositionFunktion.PO, value: "PO" },
    { key: ApiFreigabePositionFunktion.AL, value: "AL" },
  ];
}
