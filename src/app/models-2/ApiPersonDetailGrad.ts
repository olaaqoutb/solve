export enum ApiPersonDetailGrad {
  FULL = "Full",
  FULL_PV_TL_NAME = "FullPvTlName",
  STEMPELN = "Stempeln",
  NAME = "Name",
  MINIMUM = "Minimum",
  ME = "Me",
  ID = "Id",
}

export function getApiPersonDetailGradDisplayValues(): { key: ApiPersonDetailGrad, value: string }[] {
  return [
    { key: ApiPersonDetailGrad.FULL, value: "Full" },
    { key: ApiPersonDetailGrad.FULL_PV_TL_NAME, value: "FullPvTlName" },
    { key: ApiPersonDetailGrad.STEMPELN, value: "Stempeln" },
    { key: ApiPersonDetailGrad.NAME, value: "Name" },
    { key: ApiPersonDetailGrad.MINIMUM, value: "Minimum" },
    { key: ApiPersonDetailGrad.ME, value: "Me" },
    { key: ApiPersonDetailGrad.ID, value: "Id" },
  ];
}
