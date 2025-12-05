export enum ApiZeitTyp {
  ARBEITSZEIT = "Arbeitszeit",
  REMOTEZEIT = "Remotezeit",
  BEREITSCHAFT = "Bereitschaft",
  URLAUB = "Urlaub",
  ZEITAUSGLEICH = "Zeitausgleich",
  KRANKENSTAND = "Krankenstand",
  GUTSCHRIFT = "Gutschrift",
  ABWESENHEIT = "Abwesenheit",
  TELEARBEIT = "Telearbeit",
}

export function getApiZeitTypDisplayValues(): { key: ApiZeitTyp, value: string }[] {
  return [
    { key: ApiZeitTyp.ARBEITSZEIT, value: "Arbeitszeit" },
    { key: ApiZeitTyp.REMOTEZEIT, value: "Remotezeit" },
    { key: ApiZeitTyp.BEREITSCHAFT, value: "Bereitschaft" },
    { key: ApiZeitTyp.URLAUB, value: "Urlaub" },
    { key: ApiZeitTyp.ZEITAUSGLEICH, value: "Zeitausgleich" },
    { key: ApiZeitTyp.KRANKENSTAND, value: "Krankenstand" },
    { key: ApiZeitTyp.GUTSCHRIFT, value: "Gutschrift" },
    { key: ApiZeitTyp.ABWESENHEIT, value: "Abwesenheit" },
    { key: ApiZeitTyp.TELEARBEIT, value: "Telearbeit" },
  ];
}
