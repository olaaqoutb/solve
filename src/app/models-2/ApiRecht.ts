export enum ApiRecht {
  STEMPELN = "stempeln",
  FREIER_LAN_ZUGANG = "freier LAN Zugang",
  REMOTE_USER = "Remote User",
  BEREITSCHAFT = "Bereitschaft",
  ONLINE_STEMPELN_BUERO = "Online Stempeln B\u00fcro",
  ONLINE_STEMPELN_HOMEOFFICE = "Online Stempeln Homeoffice",
  TELEARBEITER = "Telearbeiter",
}

export function getApiRechtDisplayValues(): { key: ApiRecht, value: string }[] {
  return [
    { key: ApiRecht.STEMPELN, value: "stempeln" },
    { key: ApiRecht.FREIER_LAN_ZUGANG, value: "freier LAN Zugang" },
    { key: ApiRecht.REMOTE_USER, value: "Remote User" },
    { key: ApiRecht.BEREITSCHAFT, value: "Bereitschaft" },
    { key: ApiRecht.ONLINE_STEMPELN_BUERO, value: "Online Stempeln B\u00fcro" },
    { key: ApiRecht.ONLINE_STEMPELN_HOMEOFFICE, value: "Online Stempeln Homeoffice" },
    { key: ApiRecht.TELEARBEITER, value: "Telearbeiter" },
  ];
}
