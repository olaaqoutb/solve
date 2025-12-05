export enum ApiEnvironment {
  LOCAL = "Local",
  DEVELOPMENT = "Development",
  TEST = "Test",
  PRODUCTION = "Production",
}

export function getApiEnvironmentDisplayValues(): { key: ApiEnvironment, value: string }[] {
  return [
    { key: ApiEnvironment.LOCAL, value: "Local" },
    { key: ApiEnvironment.DEVELOPMENT, value: "Development" },
    { key: ApiEnvironment.TEST, value: "Test" },
    { key: ApiEnvironment.PRODUCTION, value: "Production" },
  ];
}
