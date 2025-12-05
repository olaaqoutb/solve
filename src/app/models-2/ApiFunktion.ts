export enum ApiFunktion {
  TEAMLEITER = "Teamleiter",
  ABTEILUNGSLEITER = "Abteilungsleiter",
}

export function getApiFunktionDisplayValues(): { key: ApiFunktion, value: string }[] {
  return [
    { key: ApiFunktion.TEAMLEITER, value: "Teamleiter" },
    { key: ApiFunktion.ABTEILUNGSLEITER, value: "Abteilungsleiter" },
  ];
}
