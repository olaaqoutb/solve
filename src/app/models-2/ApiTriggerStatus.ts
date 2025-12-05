export enum ApiTriggerStatus {
  OFFEN = "Offen",
  IN_ARBEIT = "In Arbeit",
  ERLEDIGT = "Erledigt",
  NICHT_VERARBEITET = "Nicht Verarbeitet",
}

export function getApiTriggerStatusDisplayValues(): { key: ApiTriggerStatus, value: string }[] {
  return [
    { key: ApiTriggerStatus.OFFEN, value: "Offen" },
    { key: ApiTriggerStatus.IN_ARBEIT, value: "In Arbeit" },
    { key: ApiTriggerStatus.ERLEDIGT, value: "Erledigt" },
    { key: ApiTriggerStatus.NICHT_VERARBEITET, value: "Nicht Verarbeitet" },
  ];
}
