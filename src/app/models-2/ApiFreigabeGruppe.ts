export enum ApiFreigabeGruppe {
  ARCHITEKTUR = "Architektur",
  ASSISTENZ = "Assistenz",
  BACKUP_RECOVERY = "Backup & Recovery",
  E_BF_LINUX = "eBF Linux",
  E_BF_NETZ = "eBF Netz",
  E_BF_WIN = "eBF Win",
  E_BF_Z_OS = "eBF zOS",
  IKT_ENTWICKLER_PF = "IKT Entwickler PF",
  JOBVERARBEITUNG = "Jobverarbeitung",
  SERVICE_MANAGER = "Service Manager",
  JIRA_SERVICES = "Jira Services",
  TECHN_INITIATIVEN = "techn. Initiativen",
  E_BF_PORTAL = "eBF Portal",
  PROJEKTUNTERSTUETZUNG = "Projektunterst\u00fctzung",
  TESTMANAGEMENT = "Testmanagement",
}

export function getApiFreigabeGruppeDisplayValues(): { key: ApiFreigabeGruppe, value: string }[] {
  return [
    { key: ApiFreigabeGruppe.ARCHITEKTUR, value: "Architektur" },
    { key: ApiFreigabeGruppe.ASSISTENZ, value: "Assistenz" },
    { key: ApiFreigabeGruppe.BACKUP_RECOVERY, value: "Backup & Recovery" },
    { key: ApiFreigabeGruppe.E_BF_LINUX, value: "eBF Linux" },
    { key: ApiFreigabeGruppe.E_BF_NETZ, value: "eBF Netz" },
    { key: ApiFreigabeGruppe.E_BF_WIN, value: "eBF Win" },
    { key: ApiFreigabeGruppe.E_BF_Z_OS, value: "eBF zOS" },
    { key: ApiFreigabeGruppe.IKT_ENTWICKLER_PF, value: "IKT Entwickler PF" },
    { key: ApiFreigabeGruppe.JOBVERARBEITUNG, value: "Jobverarbeitung" },
    { key: ApiFreigabeGruppe.SERVICE_MANAGER, value: "Service Manager" },
    { key: ApiFreigabeGruppe.JIRA_SERVICES, value: "Jira Services" },
    { key: ApiFreigabeGruppe.TECHN_INITIATIVEN, value: "techn. Initiativen" },
    { key: ApiFreigabeGruppe.E_BF_PORTAL, value: "eBF Portal" },
    { key: ApiFreigabeGruppe.PROJEKTUNTERSTUETZUNG, value: "Projektunterst\u00fctzung" },
    { key: ApiFreigabeGruppe.TESTMANAGEMENT, value: "Testmanagement" },
  ];
}
