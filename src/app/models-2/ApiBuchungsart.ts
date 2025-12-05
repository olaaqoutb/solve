export enum ApiBuchungsart {
  BUCHUNG = "Buchung",
  KORREKTUR = "Korrektur",
  NACHVERRECHNUNG = "Nachverrechnung",
  NACHTRAG = "Nachtrag",
}

export function getApiBuchungsartDisplayValues(): { key: ApiBuchungsart, value: string }[] {
  return [
    { key: ApiBuchungsart.BUCHUNG, value: "Buchung" },
    { key: ApiBuchungsart.KORREKTUR, value: "Korrektur" },
    { key: ApiBuchungsart.NACHVERRECHNUNG, value: "Nachverrechnung" },
    { key: ApiBuchungsart.NACHTRAG, value: "Nachtrag" },
  ];
}
