export enum ApiAnwesendStatus {
  ANWESEND = "Anwesend",
  ANWESEND_HOMEOFFICE = "Anwesend Homeoffice",
  WAR_HEUTE_ANWESEND = "War heute anwesend",
  WAR_HEUTE_ANWESEND_UND_KOMMT_WIEDER = "War heute anwesend und kommt wieder",
  KRANKENSTAND = "Krankenstand",
  URLAUB = "Urlaub",
  ZEITAUSGLEICH_GUTSCHRIFT = "ZeitausgleichGutschrift",
  ABWESEND = "Abwesend",
  UNBEKANNT = "Unbekannt",
}

export function getApiAnwesendStatusDisplayValues(): { key: ApiAnwesendStatus, value: string }[] {
  return [
    { key: ApiAnwesendStatus.ANWESEND, value: "Anwesend" },
    { key: ApiAnwesendStatus.ANWESEND_HOMEOFFICE, value: "Anwesend Homeoffice" },
    { key: ApiAnwesendStatus.WAR_HEUTE_ANWESEND, value: "War heute anwesend" },
    { key: ApiAnwesendStatus.WAR_HEUTE_ANWESEND_UND_KOMMT_WIEDER, value: "War heute anwesend und kommt wieder" },
    { key: ApiAnwesendStatus.KRANKENSTAND, value: "Krankenstand" },
    { key: ApiAnwesendStatus.URLAUB, value: "Urlaub" },
    { key: ApiAnwesendStatus.ZEITAUSGLEICH_GUTSCHRIFT, value: "ZeitausgleichGutschrift" },
    { key: ApiAnwesendStatus.ABWESEND, value: "Abwesend" },
    { key: ApiAnwesendStatus.UNBEKANNT, value: "Unbekannt" },
  ];
}
