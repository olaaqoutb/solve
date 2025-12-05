export enum ApiVertragDetailGrad {
  FULL = "Full",
  UEBERSICHT = "Uebersicht",
}

export function getApiVertragDetailGradDisplayValues(): { key: ApiVertragDetailGrad, value: string }[] {
  return [
    { key: ApiVertragDetailGrad.FULL, value: "Full" },
    { key: ApiVertragDetailGrad.UEBERSICHT, value: "Uebersicht" },
  ];
}
