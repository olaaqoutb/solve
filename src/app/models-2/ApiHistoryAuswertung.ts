export enum ApiHistoryAuswertung {
  PERSON = "Person",
  VERTRAG = "Vertrag",
  VERTRAGPOSITION = "Vertragposition",
  VERTRAGPOSITIONVERBRAUCHER = "Vertragpositionverbraucher",
  STUNDENPLANUNG = "Stundenplanung",
  PRODUKT = "Produkt",
  PRODUKTPOSITION = "Produktposition",
  PRODUKTPOSITIONBUCHUNGSPUNKT = "Produktpositionbuchungspunkt",
  FREIGABE_POSITION = "FreigabePosition",
}

export function getApiHistoryAuswertungDisplayValues(): { key: ApiHistoryAuswertung, value: string }[] {
  return [
    { key: ApiHistoryAuswertung.PERSON, value: "Person" },
    { key: ApiHistoryAuswertung.VERTRAG, value: "Vertrag" },
    { key: ApiHistoryAuswertung.VERTRAGPOSITION, value: "Vertragposition" },
    { key: ApiHistoryAuswertung.VERTRAGPOSITIONVERBRAUCHER, value: "Vertragpositionverbraucher" },
    { key: ApiHistoryAuswertung.STUNDENPLANUNG, value: "Stundenplanung" },
    { key: ApiHistoryAuswertung.PRODUKT, value: "Produkt" },
    { key: ApiHistoryAuswertung.PRODUKTPOSITION, value: "Produktposition" },
    { key: ApiHistoryAuswertung.PRODUKTPOSITIONBUCHUNGSPUNKT, value: "Produktpositionbuchungspunkt" },
    { key: ApiHistoryAuswertung.FREIGABE_POSITION, value: "FreigabePosition" },
  ];
}
