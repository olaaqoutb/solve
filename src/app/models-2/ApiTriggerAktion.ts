export enum ApiTriggerAktion {
  STUNDENSATZAENDERUNG = "Stundensatz\u00e4nderung",
  BASISSTUNDENSATZAENDERUNG = "Basisstundensatz\u00e4nderung",
  BASISSTUNDENSATZAENDERUNG_VB = "Basisstundensatz\u00e4nderung Verbraucher",
  LK_AEND_VERBRAUCHER = "Lk \u00c4nderung Verbraucher",
}

export function getApiTriggerAktionDisplayValues(): { key: ApiTriggerAktion, value: string }[] {
  return [
    { key: ApiTriggerAktion.STUNDENSATZAENDERUNG, value: "Stundensatz\u00e4nderung" },
    { key: ApiTriggerAktion.BASISSTUNDENSATZAENDERUNG, value: "Basisstundensatz\u00e4nderung" },
    { key: ApiTriggerAktion.BASISSTUNDENSATZAENDERUNG_VB, value: "Basisstundensatz\u00e4nderung Verbraucher" },
    { key: ApiTriggerAktion.LK_AEND_VERBRAUCHER, value: "Lk \u00c4nderung Verbraucher" },
  ];
}
