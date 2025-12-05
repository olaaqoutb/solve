export enum ApiVertragBezugsart {
  BBG_ABRUF = "BBG-Abruf",
  BRZ_ABRUF = "BRZ-Abruf",
  DIREKTVERGABE = "Direktvergabe",
  BMI_AUSSCHREIBUNG = "BMI-Ausschreibung",
}

export function getApiVertragBezugsartDisplayValues(): { key: ApiVertragBezugsart, value: string }[] {
  return [
    { key: ApiVertragBezugsart.BBG_ABRUF, value: "BBG-Abruf" },
    { key: ApiVertragBezugsart.BRZ_ABRUF, value: "BRZ-Abruf" },
    { key: ApiVertragBezugsart.DIREKTVERGABE, value: "Direktvergabe" },
    { key: ApiVertragBezugsart.BMI_AUSSCHREIBUNG, value: "BMI-Ausschreibung" },
  ];
}
