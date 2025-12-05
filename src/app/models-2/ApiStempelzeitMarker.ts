export enum ApiStempelzeitMarker {
  TEMP_ABWESENHEIT = "tempor\u00e4re Abwesenheit",
  CHIP_STEMPELN_ANMELDUNG = "Chip Stempeln Anmeldung",
  CHIP_STEMPELN_ABMELDUNG = "Chip Stempeln Abmeldung",
  ONLINE_STEMPELN_ANMELDUNG = "Online Stempeln Anmeldung",
  ONLINE_STEMPELN_ABMELDUNG = "Online Stempeln Abmeldung",
  HOMEOFFICE_STEMPELN_ANMELDUNG = "Homeoffice Stempeln Anmeldung",
  HOMEOFFICE_STEMPELN_ABMELDUNG = "Homeoffice Stempeln Abmeldung",
}

export function getApiStempelzeitMarkerDisplayValues(): { key: ApiStempelzeitMarker, value: string }[] {
  return [
    { key: ApiStempelzeitMarker.TEMP_ABWESENHEIT, value: "tempor\u00e4re Abwesenheit" },
    { key: ApiStempelzeitMarker.CHIP_STEMPELN_ANMELDUNG, value: "Chip Stempeln Anmeldung" },
    { key: ApiStempelzeitMarker.CHIP_STEMPELN_ABMELDUNG, value: "Chip Stempeln Abmeldung" },
    { key: ApiStempelzeitMarker.ONLINE_STEMPELN_ANMELDUNG, value: "Online Stempeln Anmeldung" },
    { key: ApiStempelzeitMarker.ONLINE_STEMPELN_ABMELDUNG, value: "Online Stempeln Abmeldung" },
    { key: ApiStempelzeitMarker.HOMEOFFICE_STEMPELN_ANMELDUNG, value: "Homeoffice Stempeln Anmeldung" },
    { key: ApiStempelzeitMarker.HOMEOFFICE_STEMPELN_ABMELDUNG, value: "Homeoffice Stempeln Abmeldung" },
  ];
}
