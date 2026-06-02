import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TvaReport, TvaLineGroup } from '@/actions/finance/get-tva-report';

function fmt(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const TYPE_SHORT: Record<string, string> = { FACTURE: 'FAC', AVOIR: 'AVO' };
const REGIME_SHORT: Record<string, string> = { NORMAL: 'TVA 18%', EXONERE: 'Exonéré', TPU: 'TPU' };

const s = StyleSheet.create({
  page:    { fontFamily: 'Helvetica', fontSize: 9, paddingTop: 36, paddingBottom: 56, paddingHorizontal: 40, color: '#111111' },
  header:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  title:   { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1e3a5f' },
  sub:     { fontSize: 8, color: '#6b7280', marginTop: 3 },
  cabinet: { alignItems: 'flex-end' },
  cabName: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  cabLine: { fontSize: 7.5, color: '#6b7280', marginTop: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginBottom: 14 },

  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpi:    { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, padding: 8 },
  kpiLbl: { fontSize: 6.5, color: '#6b7280', textTransform: 'uppercase', marginBottom: 3 },
  kpiVal: { fontSize: 11, fontFamily: 'Helvetica-Bold' },

  sectionTitle: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginBottom: 5, color: '#1e3a5f' },

  tableHeader: { flexDirection: 'row', backgroundColor: '#1e3a5f', paddingVertical: 4, paddingHorizontal: 4 },
  th:          { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#ffffff' },
  row:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 3.5, paddingHorizontal: 4 },
  rowAlt:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 3.5, paddingHorizontal: 4, backgroundColor: '#f9fafb' },
  rowTotal:    { flexDirection: 'row', borderTopWidth: 1.5, borderTopColor: '#d1d5db', paddingVertical: 4, paddingHorizontal: 4, backgroundColor: '#f3f4f6' },
  td:          { fontSize: 8 },

  colRegime: { flex: 3 },
  colNb:     { width: 30, textAlign: 'right' },
  colHT:     { width: 75, textAlign: 'right' },
  colTVA:    { width: 75, textAlign: 'right' },
  colTTC:    { width: 75, textAlign: 'right' },

  colDate:   { width: 52 },
  colRef:    { width: 80 },
  colType:   { width: 24 },
  colClient: { flex: 2 },
  colReg:    { width: 44 },
  colHT2:    { width: 62, textAlign: 'right' },
  colTVA2:   { width: 58, textAlign: 'right' },
  colTTC2:   { width: 62, textAlign: 'right' },

  recapBox:   { alignItems: 'flex-end', marginTop: 10 },
  recapRow:   { flexDirection: 'row', width: 220, marginBottom: 3 },
  recapLabel: { flex: 1, color: '#555555', fontSize: 8 },
  recapValue: { width: 80, textAlign: 'right', fontSize: 8 },
  recapFinal: { flexDirection: 'row', width: 220, backgroundColor: '#1e3a5f', paddingVertical: 5, paddingHorizontal: 6, borderRadius: 3, marginTop: 4 },
  finalLabel: { flex: 1, color: '#ffffff', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  finalValue: { width: 80, textAlign: 'right', color: '#ffffff', fontSize: 9, fontFamily: 'Helvetica-Bold' },

  spacer:  { marginBottom: 14 },
  footer:  { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1e3a5f', paddingVertical: 8, paddingHorizontal: 40 },
  ftText:  { fontSize: 7.5, color: '#ffffff', textAlign: 'center' },
});

type Cabinet = {
  company_name: string; VAT_number: string; TAX_number: string | null;
  city: string | null; phone: string | null; email: string | null;
} | null;

function GroupTable({ groups, isAvoir = false }: { groups: TvaLineGroup[]; isAvoir?: boolean }) {
  if (groups.length === 0) return null;
  const totalHT  = groups.reduce((s, g) => s + g.baseHT,   0);
  const totalTVA = groups.reduce((s, g) => s + g.tva,      0);
  const totalTTC = groups.reduce((s, g) => s + g.totalTTC, 0);
  const sign     = isAvoir ? '−' : '';

  return (
    <>
      <View style={s.tableHeader}>
        <Text style={[s.th, s.colRegime]}>Régime fiscal</Text>
        <Text style={[s.th, s.colNb]}>Nb</Text>
        <Text style={[s.th, s.colHT]}>Base HT</Text>
        <Text style={[s.th, s.colTVA]}>TVA</Text>
        <Text style={[s.th, s.colTTC]}>Total TTC</Text>
      </View>
      {groups.map((g, i) => (
        <View key={g.regime} style={i % 2 === 0 ? s.row : s.rowAlt}>
          <Text style={[s.td, s.colRegime]}>{g.label}</Text>
          <Text style={[s.td, s.colNb]}>{g.count}</Text>
          <Text style={[s.td, s.colHT]}>{sign}{fmt(g.baseHT)}</Text>
          <Text style={[s.td, s.colTVA, { color: isAvoir ? '#c2410c' : '#111111' }]}>{sign}{fmt(g.tva)}</Text>
          <Text style={[s.td, s.colTTC]}>{sign}{fmt(g.totalTTC)}</Text>
        </View>
      ))}
      <View style={s.rowTotal}>
        <Text style={[s.td, s.colRegime, { fontFamily: 'Helvetica-Bold' }]}>Total</Text>
        <Text style={[s.td, s.colNb, { fontFamily: 'Helvetica-Bold' }]}>{groups.reduce((s, g) => s + g.count, 0)}</Text>
        <Text style={[s.td, s.colHT, { fontFamily: 'Helvetica-Bold' }]}>{sign}{fmt(totalHT)}</Text>
        <Text style={[s.td, s.colTVA, { fontFamily: 'Helvetica-Bold', color: isAvoir ? '#c2410c' : '#111111' }]}>{sign}{fmt(totalTVA)}</Text>
        <Text style={[s.td, s.colTTC, { fontFamily: 'Helvetica-Bold' }]}>{sign}{fmt(totalTTC)}</Text>
      </View>
    </>
  );
}

export function TvaReportPDF({ report, cabinet }: { report: TvaReport; cabinet: Cabinet }) {
  const cabName = cabinet?.company_name ?? 'Cabinet';
  const footerParts = [cabName];
  if (cabinet?.VAT_number) footerParts.push(`NIF : ${cabinet.VAT_number}`);
  if (cabinet?.TAX_number) footerParts.push(`RCCM : ${cabinet.TAX_number}`);
  if (cabinet?.city)       footerParts.push(`${cabinet.city} – Togo`);
  if (cabinet?.phone)      footerParts.push(`Tél : ${cabinet.phone}`);
  if (cabinet?.email)      footerParts.push(cabinet.email);

  return (
    <Document title={`Rapport TVA — ${report.periodLabel}`} author={cabName}>
      <Page size="A4" style={s.page}>

        {/* En-tête */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>RAPPORT TVA</Text>
            <Text style={s.sub}>{report.periodLabel}</Text>
            <Text style={s.sub}>
              Du {fmtDate(report.start)} au {fmtDate(report.end)}
            </Text>
          </View>
          <View style={s.cabinet}>
            <Text style={s.cabName}>{cabName}</Text>
            {cabinet?.VAT_number && <Text style={s.cabLine}>NIF : {cabinet.VAT_number}</Text>}
            {cabinet?.city && <Text style={s.cabLine}>{cabinet.city} – Togo</Text>}
            {cabinet?.phone && <Text style={s.cabLine}>Tél : {cabinet.phone}</Text>}
          </View>
        </View>

        <View style={s.divider} />

        {/* KPIs */}
        <View style={s.kpiRow}>
          <View style={s.kpi}>
            <Text style={s.kpiLbl}>CA HT imposable</Text>
            <Text style={s.kpiVal}>{fmt(report.totalFactureHT)} FCFA</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiLbl}>TVA facturée</Text>
            <Text style={s.kpiVal}>{fmt(report.totalFactureTVA)} FCFA</Text>
          </View>
          <View style={[s.kpi, { borderColor: '#fed7aa', backgroundColor: '#fff7ed' }]}>
            <Text style={s.kpiLbl}>TVA avoirs (−)</Text>
            <Text style={[s.kpiVal, { color: '#c2410c' }]}>−{fmt(report.totalAvoirTVA)} FCFA</Text>
          </View>
          <View style={[s.kpi, { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }]}>
            <Text style={s.kpiLbl}>TVA nette à reverser</Text>
            <Text style={[s.kpiVal, { color: '#1d4ed8' }]}>{fmt(report.tvaCollecteeNette)} FCFA</Text>
          </View>
        </View>

        {/* Section 1 : Factures */}
        {report.facturesGroups.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Opérations imposables — Factures émises</Text>
            <GroupTable groups={report.facturesGroups} />
            <View style={s.spacer} />
          </>
        )}

        {/* Section 2 : Avoirs */}
        {report.avoirsGroups.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Ajustements — Avoirs émis</Text>
            <GroupTable groups={report.avoirsGroups} isAvoir />
            <View style={s.spacer} />
          </>
        )}

        {/* Récapitulatif TVA */}
        <View style={s.recapBox}>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>TVA collectée (factures)</Text>
            <Text style={s.recapValue}>{fmt(report.totalFactureTVA)} FCFA</Text>
          </View>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>TVA avoirs (déduction)</Text>
            <Text style={[s.recapValue, { color: '#c2410c' }]}>−{fmt(report.totalAvoirTVA)} FCFA</Text>
          </View>
          <View style={s.recapRow}>
            <Text style={s.recapLabel}>TVA déductible (achats)</Text>
            <Text style={[s.recapValue, { color: '#6b7280' }]}>0 FCFA</Text>
          </View>
          <View style={s.recapFinal}>
            <Text style={s.finalLabel}>TVA NETTE À REVERSER</Text>
            <Text style={s.finalValue}>{fmt(report.tvaCollecteeNette)} FCFA</Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={s.footer} fixed>
          <Text style={s.ftText}>{footerParts.join('   ·   ')}</Text>
        </View>

      </Page>

      {/* Page 2 : détail des opérations */}
      {report.documents.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={[s.sectionTitle, { fontSize: 11, marginBottom: 10 }]}>
            Détail des opérations — {report.periodLabel}
          </Text>

          <View style={s.tableHeader}>
            <Text style={[s.th, s.colDate]}>Date</Text>
            <Text style={[s.th, s.colRef]}>Référence</Text>
            <Text style={[s.th, s.colType]}>Type</Text>
            <Text style={[s.th, s.colClient]}>Client</Text>
            <Text style={[s.th, s.colReg]}>Régime</Text>
            <Text style={[s.th, s.colHT2]}>Base HT</Text>
            <Text style={[s.th, s.colTVA2]}>TVA</Text>
            <Text style={[s.th, s.colTTC2]}>Total TTC</Text>
          </View>

          {report.documents.map((doc, i) => (
            <View key={`${doc.id}-${doc.type}`} style={i % 2 === 0 ? s.row : s.rowAlt}>
              <Text style={[s.td, s.colDate]}>{fmtDate(doc.issueDate)}</Text>
              <Text style={[s.td, s.colRef]}>{doc.number}</Text>
              <Text style={[s.td, s.colType, { color: doc.type === 'AVOIR' ? '#c2410c' : '#111111' }]}>
                {TYPE_SHORT[doc.type] ?? doc.type}
              </Text>
              <Text style={[s.td, s.colClient]} numberOfLines={1}>{doc.client}</Text>
              <Text style={[s.td, s.colReg]}>{REGIME_SHORT[doc.regime] ?? doc.regime}</Text>
              <Text style={[s.td, s.colHT2]}>{doc.type === 'AVOIR' ? '−' : ''}{fmt(doc.baseHT)}</Text>
              <Text style={[s.td, s.colTVA2, { color: doc.type === 'AVOIR' ? '#c2410c' : '#111111' }]}>
                {doc.type === 'AVOIR' ? '−' : ''}{fmt(doc.tva)}
              </Text>
              <Text style={[s.td, s.colTTC2]}>{doc.type === 'AVOIR' ? '−' : ''}{fmt(doc.totalTTC)}</Text>
            </View>
          ))}

          <View style={s.footer} fixed>
            <Text style={s.ftText}>{footerParts.join('   ·   ')}</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
