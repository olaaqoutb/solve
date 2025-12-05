export enum ApiVertragsTyp {
  BETRIEB = "Betrieb",
  PROJEKT = "Projekt",
}

export function getApiVertragsTypDisplayValues(): { key: ApiVertragsTyp, value: string }[] {
  return [
    { key: ApiVertragsTyp.BETRIEB, value: "Betrieb" },
    { key: ApiVertragsTyp.PROJEKT, value: "Projekt" },
  ];
}
