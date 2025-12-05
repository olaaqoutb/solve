export enum ApiGeschlecht {
  WEIBLICH = "weiblich",
  MAENNLICH = "m\u00e4nnlich",
  INTER = "inter",
  DIVERS = "divers",
  OFFEN = "offen",
  KEINE_ANGABE = "keine Angabe",
}

export function getApiGeschlechtDisplayValues(): { key: ApiGeschlecht, value: string }[] {
  return [
    { key: ApiGeschlecht.WEIBLICH, value: "weiblich" },
    { key: ApiGeschlecht.MAENNLICH, value: "m\u00e4nnlich" },
    { key: ApiGeschlecht.INTER, value: "inter" },
    { key: ApiGeschlecht.DIVERS, value: "divers" },
    { key: ApiGeschlecht.OFFEN, value: "offen" },
    { key: ApiGeschlecht.KEINE_ANGABE, value: "keine Angabe" },
  ];
}
