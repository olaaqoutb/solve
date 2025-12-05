export enum ApiBucher {
  KEIN_BUCHER = "kein Bucher",
  LIMITIERTER_BUCHER = "limitierter Bucher",
  GEPLANTER_BUCHER = "geplanter Bucher",
  FREIER_BUCHER = "freier Bucher",
}

export function getApiBucherDisplayValues(): { key: ApiBucher, value: string }[] {
  return [
    { key: ApiBucher.KEIN_BUCHER, value: "kein Bucher" },
    { key: ApiBucher.LIMITIERTER_BUCHER, value: "limitierter Bucher" },
    { key: ApiBucher.GEPLANTER_BUCHER, value: "geplanter Bucher" },
    { key: ApiBucher.FREIER_BUCHER, value: "freier Bucher" },
  ];
}
