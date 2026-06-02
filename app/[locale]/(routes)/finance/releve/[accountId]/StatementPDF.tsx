import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

function fmt(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const TYPE_LABEL: Record<string, string> = {
  FACTURE:   'Facture',
  AVOIR:     'Avoir',
  REGLEMENT: 'Règlement',
};

const s = StyleSheet.create({
  page:    { fontFamily: 'Helvetica', fontSize: 9, paddingTop: 36, paddingBottom: 56, paddingHorizontal: 40, color: '#111111' },
  header:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  title:   { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1e3a5f' },
  sub:     { fontSize: 8.5, color: '#6b7280', marginTop: 3 },
  cabinetBlock: { alignItems: 'flex-end' },
  cabinetName: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  cabinetLine: { fontSize: 7.5, color: '#6b7280', marginTop: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginBottom: 12 },

  clientBox: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, marginBottom: 16 },
  clientName: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  clientLine: { fontSize: 8, color: '#555555' },

  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpi:    { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, padding: 8 },
  kpiLabel: { fontSize: 7, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase' },
  kpiValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },

  tableHeader: { flexDirection: 'row', backgroundColor: '#1e3a5f', color: '#ffffff', paddingVertical: 5, paddingHorizontal: 4 },
  th: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#ffffff' },
  tableRow:    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 4, paddingHorizontal: 4 },
  tableRowAlt: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 4, paddingHorizontal: 4, backgroundColor: '#f9fafb' },
  td:  { fontSize: 8 },

  colDate:  { width: 56 },
  colRef:   { width: 88 },
  colType:  { width: 52 },
  colLabel: { flex: 1 },
  colDebit: { width: 68, textAlign: 'right' },
  colCredit:{ width: 68, textAlign: 'right' },
  colSolde: { width: 72, textAlign: 'right' },

  totalsBox: { alignItems: 'flex-end', marginTop: 10 },
  totalRow:  { flexDirection: 'row', width: 220, marginBottom: 3 },
  totalLabel:{ flex: 1, color: '#555555', fontSize: 8 },
  totalValue:{ width: 80, textAlign: 'right', fontSize: 8 },
  totalFinal:{ flexDirection: 'row', width: 220, backgroundColor: '#1e3a5f', paddingVertical: 5, paddingHorizontal: 6, borderRadius: 3, marginTop: 4 },
  finalLabel:{ flex: 1, color: '#ffffff', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  finalValue:{ width: 80, textAlign: 'right', color: '#ffffff', fontSize: 9, fontFamily: 'Helvetica-Bold' },

  footer:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1e3a5f', paddingVertical: 8, paddingHorizontal: 40 },
  footerText: { fontSize: 7.5, color: '#ffffff', textAlign: 'center' },
});

type Entry = {
  date: string; ref: string; label: string;
  entryType: string; debit: number; credit: number; balance: number;
};

type Cabinet = {
  company_name: string; VAT_number: string; TAX_number: string | null;
  street: string | null; city: string | null; phone: string | null; email: string | null;
} | null;

type Account = {
  name: string; nif: string | null; billing_street: string | null;
  billing_city: string | null; email: string | null; office_phone: string | null;
};

type Props = {
  account: Account;
  entries: Entry[];
  totalDebit: number;
  totalCredit: number;
  solde: number;
  cabinet: Cabinet;
  generatedAt: string;
};

export function StatementPDF({ account, entries, totalDebit, totalCredit, solde, cabinet, generatedAt }: Props) {
  const cabinetName = cabinet?.company_name ?? 'Cabinet';
  const footerParts: string[] = [cabinetName];
  if (cabinet?.VAT_number) footerParts.push(`NIF : ${cabinet.VAT_number}`);
  if (cabinet?.TAX_number) footerParts.push(`RCCM : ${cabinet.TAX_number}`);
  if (cabinet?.city)       footerParts.push(`${cabinet.city} – Togo`);
  if (cabinet?.phone)      footerParts.push(`Tél : ${cabinet.phone}`);
  if (cabinet?.email)      footerParts.push(cabinet.email);
  const footerLine = footerParts.join('   ·   ');

  return (
    <Document title={`Relevé — ${account.name}`} author={cabinetName}>
      <Page size="A4" style={s.page}>

        {/* En-tête */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>RELEVÉ DE COMPTE CLIENT</Text>
            <Text style={s.sub}>{account.name}{account.nif ? `  ·  NIF : ${account.nif}` : ''}</Text>
            {account.billing_city && <Text style={s.sub}>{account.billing_city}</Text>}
            <Text style={[s.sub, { marginTop: 6 }]}>Édité le {fmtDate(generatedAt)}</Text>
          </View>
          <View style={s.cabinetBlock}>
            <Text style={s.cabinetName}>{cabinetName}</Text>
            {cabinet?.VAT_number && <Text style={s.cabinetLine}>NIF : {cabinet.VAT_number}</Text>}
            {cabinet?.city && <Text style={s.cabinetLine}>{cabinet.city} – Togo</Text>}
            {cabinet?.phone && <Text style={s.cabinetLine}>Tél : {cabinet.phone}</Text>}
          </View>
        </View>

        <View style={s.divider} />

        {/* KPIs */}
        <View style={s.kpiRow}>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Total facturé</Text>
            <Text style={s.kpiValue}>{fmt(totalDebit)} FCFA</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Total réglé + avoirs</Text>
            <Text style={[s.kpiValue, { color: '#15803d' }]}>{fmt(totalCredit)} FCFA</Text>
          </View>
          <View style={[s.kpi, { backgroundColor: solde > 0 ? '#fff7ed' : '#f0fdf4', borderColor: solde > 0 ? '#fed7aa' : '#bbf7d0' }]}>
            <Text style={s.kpiLabel}>Solde dû</Text>
            <Text style={[s.kpiValue, { color: solde > 0 ? '#c2410c' : '#15803d' }]}>
              {fmt(Math.abs(solde))} FCFA
            </Text>
          </View>
        </View>

        {/* Tableau */}
        <View style={s.tableHeader}>
          <Text style={[s.th, s.colDate]}>Date</Text>
          <Text style={[s.th, s.colRef]}>Référence</Text>
          <Text style={[s.th, s.colType]}>Type</Text>
          <Text style={[s.th, s.colLabel]}>Libellé</Text>
          <Text style={[s.th, s.colDebit]}>Débit</Text>
          <Text style={[s.th, s.colCredit]}>Crédit</Text>
          <Text style={[s.th, s.colSolde]}>Solde</Text>
        </View>

        {entries.map((entry, i) => (
          <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.td, s.colDate]}>{fmtDate(entry.date)}</Text>
            <Text style={[s.td, s.colRef]}>{entry.ref}</Text>
            <Text style={[s.td, s.colType]}>{TYPE_LABEL[entry.entryType] ?? entry.entryType}</Text>
            <Text style={[s.td, s.colLabel]} numberOfLines={1}>{entry.label}</Text>
            <Text style={[s.td, s.colDebit]}>
              {entry.debit > 0 ? fmt(entry.debit) : '—'}
            </Text>
            <Text style={[s.td, s.colCredit, { color: '#15803d' }]}>
              {entry.credit > 0 ? fmt(entry.credit) : '—'}
            </Text>
            <Text style={[s.td, s.colSolde, { fontFamily: 'Helvetica-Bold', color: entry.balance > 0 ? '#c2410c' : '#15803d' }]}>
              {fmt(Math.abs(entry.balance))}{entry.balance !== 0 ? (entry.balance > 0 ? ' DB' : ' CR') : ''}
            </Text>
          </View>
        ))}

        {/* Totaux */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total débit (facturé)</Text>
            <Text style={s.totalValue}>{fmt(totalDebit)} FCFA</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total crédit (réglé + avoirs)</Text>
            <Text style={[s.totalValue, { color: '#15803d' }]}>{fmt(totalCredit)} FCFA</Text>
          </View>
          <View style={s.totalFinal}>
            <Text style={s.finalLabel}>SOLDE DÛ</Text>
            <Text style={s.finalValue}>{fmt(Math.abs(solde))} FCFA {solde > 0 ? 'DB' : 'CR'}</Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{footerLine}</Text>
        </View>

      </Page>
    </Document>
  );
}
