export enum ApiStempelzeitEintragungsart {
  NORMAL = "Normal",
  SELBST = "Selbst",
}

export function getApiStempelzeitEintragungsartDisplayValues(): { key: ApiStempelzeitEintragungsart, value: string }[] {
  return [
    { key: ApiStempelzeitEintragungsart.NORMAL, value: "Normal" },
    { key: ApiStempelzeitEintragungsart.SELBST, value: "Selbst" },
  ];
}
