export enum ApiMitarbeiterart {
  INTERN = "intern",
  EXTERN = "extern",
  DIENSTVERWENDUNG = "Dienstverwendung",
  ZIVILDIENSTLEISTENDER = "Zivildienstleistender",
  LEHRLING = "Lehrling",
  PRAKTIKANT = "Praktikant",
  PAYROLL = "Payroll",
  EXTERN_OHNE_BAKS = "extern ohne BAKS",
}

export function getApiMitarbeiterartDisplayValues(): { key: ApiMitarbeiterart, value: string }[] {
  return [
    { key: ApiMitarbeiterart.INTERN, value: "intern" },
    { key: ApiMitarbeiterart.EXTERN, value: "extern" },
    { key: ApiMitarbeiterart.DIENSTVERWENDUNG, value: "Dienstverwendung" },
    { key: ApiMitarbeiterart.ZIVILDIENSTLEISTENDER, value: "Zivildienstleistender" },
    { key: ApiMitarbeiterart.LEHRLING, value: "Lehrling" },
    { key: ApiMitarbeiterart.PRAKTIKANT, value: "Praktikant" },
    { key: ApiMitarbeiterart.PAYROLL, value: "Payroll" },
    { key: ApiMitarbeiterart.EXTERN_OHNE_BAKS, value: "extern ohne BAKS" },
  ];
}
