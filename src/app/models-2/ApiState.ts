export enum ApiState {
  READ = "read",
  NEW = "new",
  VIEWED = "viewed",
  UPDATED = "updated",
}

export function getApiStateDisplayValues(): { key: ApiState, value: string }[] {
  return [
    { key: ApiState.READ, value: "read" },
    { key: ApiState.NEW, value: "new" },
    { key: ApiState.VIEWED, value: "viewed" },
    { key: ApiState.UPDATED, value: "updated" },
  ];
}
