export enum ApiReife {
  JUNIOR = "Junior",
  REGULAR = "Regular",
  SENIOR = "Senior",
}

export function getApiReifeDisplayValues(): { key: ApiReife, value: string }[] {
  return [
    { key: ApiReife.JUNIOR, value: "Junior" },
    { key: ApiReife.REGULAR, value: "Regular" },
    { key: ApiReife.SENIOR, value: "Senior" },
  ];
}
