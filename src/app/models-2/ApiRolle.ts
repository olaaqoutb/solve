export enum ApiRolle {
  DEFAULT = "Default",
  PROJECT_OFFICE = "ProjectOffice",
  PROJECT_OFFICE_READ_ONLY = "ProjectOffice Read Only",
  ADMIN_PROJECT_OFFICE = "Admin ProjectOffice",
  ADMIN_LEITER = "Admin Leiter",
}

export function getApiRolleDisplayValues(): { key: ApiRolle, value: string }[] {
  return [
    { key: ApiRolle.DEFAULT, value: "Default" },
    { key: ApiRolle.PROJECT_OFFICE, value: "ProjectOffice" },
    { key: ApiRolle.PROJECT_OFFICE_READ_ONLY, value: "ProjectOffice Read Only" },
    { key: ApiRolle.ADMIN_PROJECT_OFFICE, value: "Admin ProjectOffice" },
    { key: ApiRolle.ADMIN_LEITER, value: "Admin Leiter" },
  ];
}
