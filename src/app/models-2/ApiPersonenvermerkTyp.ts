export enum ApiPersonenvermerkTyp {
  STD_LIMIT_10 = "StdLimit10",
  STD_LIMIT_160 = "StdLimit160",
  INFO_PDF = "InfoPdf",
  BUCHUNGSERINNERUNG = "Buchungserinnerung",
  STRAFREGISTER = "Strafregister",
  INTERESSENSKONFLIKT = "Interessenskonflikt",
}

export function getApiPersonenvermerkTypDisplayValues(): { key: ApiPersonenvermerkTyp, value: string }[] {
  return [
    { key: ApiPersonenvermerkTyp.STD_LIMIT_10, value: "StdLimit10" },
    { key: ApiPersonenvermerkTyp.STD_LIMIT_160, value: "StdLimit160" },
    { key: ApiPersonenvermerkTyp.INFO_PDF, value: "InfoPdf" },
    { key: ApiPersonenvermerkTyp.BUCHUNGSERINNERUNG, value: "Buchungserinnerung" },
    { key: ApiPersonenvermerkTyp.STRAFREGISTER, value: "Strafregister" },
    { key: ApiPersonenvermerkTyp.INTERESSENSKONFLIKT, value: "Interessenskonflikt" },
  ];
}
