export enum ApiVerbraucherTyp {
  PERSONAL = "Personal",
  FIXKOSTEN = "Fixkosten",
  VARIABLE_KOSTEN = "variable Kosten",
}

export function getApiVerbraucherTypDisplayValues(): { key: ApiVerbraucherTyp, value: string }[] {
  return [
    { key: ApiVerbraucherTyp.PERSONAL, value: "Personal" },
    { key: ApiVerbraucherTyp.FIXKOSTEN, value: "Fixkosten" },
    { key: ApiVerbraucherTyp.VARIABLE_KOSTEN, value: "variable Kosten" },
  ];
}
