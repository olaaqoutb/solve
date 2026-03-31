export enum ApiAuswertungsart {
  ALLE = 'ALLE',
  DV = 'DV',
  EV = 'EV',
  PV = 'PV',
  TL = 'TL',
  EIGENE = 'EIGENE',
   EV_SOLL_IST = 'EV_SOLL_IST',
  EV_SOLL_IST_VORJAHR = 'EV_SOLL_IST_VORJAHR',

  DV_SOLL_IST = 'DV_SOLL_IST',
  DV_SOLL_IST_VORJAHR = 'DV_SOLL_IST_VORJAHR',

  PV_SOLL_IST = 'PV_SOLL_IST',
  PV_SOLL_IST_VORJAHR = 'PV_SOLL_IST_VORJAHR',

  TL_SOLL_IST = 'TL_SOLL_IST',
  TL_SOLL_IST_VORJAHR = 'TL_SOLL_IST_VORJAHR',

  VERTRAGS_PARTNER = 'VERTRAGS_PARTNER',
  FREIGABEGRUPPEN = 'FREIGABEGRUPPEN',

  ABWESENHEIT_ALLE = 'ABWESENHEIT_ALLE',
  ABWESENHEIT_PV = 'ABWESENHEIT_PV',
  ABWESENHEIT_TL = 'ABWESENHEIT_TL',

  PERSONENDATEN = 'PERSONENDATEN',
}

export function getApiAuswertungsartDisplayValues(): { key: ApiAuswertungsart; value: string }[] {
  return [
    { key: ApiAuswertungsart.EIGENE, value: 'Eigene Auswertung' },
    { key: ApiAuswertungsart.ALLE, value: 'Alle Auswertungen' },

    { key: ApiAuswertungsart.EV, value: 'Ergebnisverantwortlicher' },
    { key: ApiAuswertungsart.EV_SOLL_IST, value: 'Ergebnisverantwortlicher Soll-Ist Vergleich' },
    { key: ApiAuswertungsart.EV_SOLL_IST_VORJAHR, value: 'Ergebnisverantwortlicher Soll-Ist Vergleich [Vorjahr]' },

    { key: ApiAuswertungsart.DV, value: 'Durchführungsverantwortlicher' },
    { key: ApiAuswertungsart.DV_SOLL_IST, value: 'Durchführungsverantwortlicher Soll-Ist Vergleich' },
    { key: ApiAuswertungsart.DV_SOLL_IST_VORJAHR, value: 'Durchführungsverantwortlicher Soll-Ist Vergleich [Vorjahr]' },

    { key: ApiAuswertungsart.PV, value: 'Personenverantwortlicher' },
    { key: ApiAuswertungsart.PV_SOLL_IST, value: 'Personenverantwortlicher Soll-Ist Vergleich' },
    { key: ApiAuswertungsart.PV_SOLL_IST_VORJAHR, value: 'Personenverantwortlicher Soll-Ist Vergleich [Vorjahr]' },

    { key: ApiAuswertungsart.TL, value: 'Teamleiter' },
    { key: ApiAuswertungsart.TL_SOLL_IST, value: 'Teamleiter Soll-Ist Vergleich' },
    { key: ApiAuswertungsart.TL_SOLL_IST_VORJAHR, value: 'Teamleiter Soll-Ist Vergleich [Vorjahr]' },

    { key: ApiAuswertungsart.VERTRAGS_PARTNER, value: 'Vertragspartner' },

    { key: ApiAuswertungsart.FREIGABEGRUPPEN, value: 'Freigabegruppen' },

    { key: ApiAuswertungsart.ABWESENHEIT_ALLE, value: 'Abwesenheiten' },
    { key: ApiAuswertungsart.ABWESENHEIT_PV, value: 'Abwesenheiten Personenverantwortlicher' },
    { key: ApiAuswertungsart.ABWESENHEIT_TL, value: 'Abwesenheiten Teamleiter' },

    { key: ApiAuswertungsart.PERSONENDATEN, value: 'Personendaten' },
  ];

}
