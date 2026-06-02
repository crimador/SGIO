import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const MONTHS_FR: Record<string, string> = {
  '01': 'Janvier', '02': 'Février',  '03': 'Mars',      '04': 'Avril',
  '05': 'Mai',     '06': 'Juin',     '07': 'Juillet',   '08': 'Août',
  '09': 'Septembre','10': 'Octobre', '11': 'Novembre',  '12': 'Décembre',
};

function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  return `${MONTHS_FR[month] ?? month} ${year}`;
}

// ─── Couleurs ─────────────────────────────────────────────────────────────────

const NAVY      = '#1e3a5f';
const GRAY_LIGHT = '#f3f4f6';
const GRAY_MED  = '#d1d5db';
const GRAY_TEXT = '#6b7280';
const TEXT      = '#111111';
const WHITE     = '#ffffff';
const GREEN     = '#16a34a';

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 36,
  },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  logo:   { width: 60, height: 60, objectFit: 'contain' },
  companyBlock: { flex: 1, paddingLeft: 12 },
  companyName:  { fontSize: 14, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 2 },
  companyInfo:  { fontSize: 8, color: GRAY_TEXT, lineHeight: 1.5 },
  titleBlock:   { alignItems: 'flex-end' },
  docTitle:     { fontSize: 16, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 },
  periodText:   { fontSize: 10, color: GRAY_TEXT },

  divider: { height: 1, backgroundColor: GRAY_MED, marginVertical: 10 },
  dividerDark: { height: 2, backgroundColor: NAVY, marginVertical: 10 },

  // Section label
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    backgroundColor: NAVY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Infos employé
  infoRow: { flexDirection: 'row', marginBottom: 12 },
  infoBlock: { flex: 1 },
  infoLabel: { fontSize: 7, color: GRAY_TEXT, marginBottom: 2, textTransform: 'uppercase' },
  infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: TEXT },
  infoSub:   { fontSize: 8, color: GRAY_TEXT, marginTop: 1 },

  // Tableau de paie
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
  },
  tableRowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: GRAY_LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_MED,
  },
  tableLabel: { fontSize: 9, color: TEXT },
  tableValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TEXT },
  tableValueGreen: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: GREEN },
  tableValueRed:   { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#dc2626' },

  // Net à payer
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  netLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: WHITE },
  netValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: WHITE },

  // Notes
  notesBox: {
    marginTop: 14,
    padding: 8,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
  },
  notesLabel: { fontSize: 7, color: GRAY_TEXT, marginBottom: 3, textTransform: 'uppercase' },
  notesText:  { fontSize: 8, color: TEXT, lineHeight: 1.5 },

  // Signatures
  signRow: { flexDirection: 'row', marginTop: 30, gap: 20 },
  signBox:  {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: GRAY_MED,
    paddingTop: 6,
  },
  signLabel: { fontSize: 8, color: GRAY_TEXT },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: GRAY_LIGHT,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: GRAY_TEXT },
});

// ─── Types ────────────────────────────────────────────────────────────────────

type PayslipData = {
  period:     string;
  baseSalary: number;
  bonuses:    number;
  deductions: number;
  netSalary:  number;
  status:     string;
  notes?:     string | null;
  employee: {
    firstName: string;
    lastName:  string;
    position?: string | null;
    IBAN?:     string | null;
  };
};

type CabinetData = {
  company_name: string | null;
  VAT_number:   string | null;
  TAX_number:   string | null;
  street:       string | null;
  city:         string | null;
  phone:        string | null;
  email:        string | null;
  logoUrl:      string | null;
} | null;

type Props = { payslip: PayslipData; cabinet: CabinetData };

// ─── Composant ────────────────────────────────────────────────────────────────

export function PayslipPDF({ payslip, cabinet }: Props) {
  const companyName = cabinet?.company_name ?? 'ENTREPRISE';
  const periodLabel = formatPeriod(payslip.period);
  const employeeName = `${payslip.employee.firstName} ${payslip.employee.lastName}`;

  const STATUS_LABELS: Record<string, string> = {
    BROUILLON: 'Brouillon',
    EMIS:      'Émis',
    PAYE:      'Payé',
  };

  return (
    <Document title={`Bulletin de paie — ${employeeName} — ${periodLabel}`}>
      <Page size="A4" style={s.page}>

        {/* ── En-tête ───────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {cabinet?.logoUrl && (
              <Image src={cabinet.logoUrl} style={s.logo} />
            )}
            <View style={s.companyBlock}>
              <Text style={s.companyName}>{companyName}</Text>
              {cabinet?.VAT_number && (
                <Text style={s.companyInfo}>NIF : {cabinet.VAT_number}</Text>
              )}
              {cabinet?.TAX_number && (
                <Text style={s.companyInfo}>RCCM : {cabinet.TAX_number}</Text>
              )}
              {(cabinet?.street || cabinet?.city) && (
                <Text style={s.companyInfo}>
                  {[cabinet.street, cabinet.city].filter(Boolean).join(', ')}
                </Text>
              )}
              {cabinet?.phone && (
                <Text style={s.companyInfo}>Tél : {cabinet.phone}</Text>
              )}
            </View>
          </View>
          <View style={s.titleBlock}>
            <Text style={s.docTitle}>BULLETIN DE PAIE</Text>
            <Text style={s.periodText}>Période : {periodLabel}</Text>
            <Text style={[s.periodText, { marginTop: 4 }]}>
              Statut : {STATUS_LABELS[payslip.status] ?? payslip.status}
            </Text>
          </View>
        </View>

        <View style={s.dividerDark} />

        {/* ── Informations employé ─────────────────────────────────────────── */}
        <Text style={s.sectionLabel}>Informations employé</Text>
        <View style={s.infoRow}>
          <View style={s.infoBlock}>
            <Text style={s.infoLabel}>Nom et prénom</Text>
            <Text style={s.infoValue}>{employeeName}</Text>
          </View>
          {payslip.employee.position && (
            <View style={s.infoBlock}>
              <Text style={s.infoLabel}>Poste / Fonction</Text>
              <Text style={s.infoValue}>{payslip.employee.position}</Text>
            </View>
          )}
          {payslip.employee.IBAN && (
            <View style={s.infoBlock}>
              <Text style={s.infoLabel}>IBAN</Text>
              <Text style={[s.infoValue, { fontFamily: 'Helvetica', fontSize: 8 }]}>
                {payslip.employee.IBAN}
              </Text>
            </View>
          )}
        </View>

        <View style={s.divider} />

        {/* ── Tableau de rémunération ─────────────────────────────────────── */}
        <Text style={s.sectionLabel}>Détail de la rémunération</Text>

        <View style={s.tableRowAlt}>
          <Text style={s.tableLabel}>Salaire de base</Text>
          <Text style={s.tableValue}>{fmt(payslip.baseSalary)} FCFA</Text>
        </View>

        <View style={s.tableRow}>
          <Text style={s.tableLabel}>Primes / Indemnités</Text>
          <Text style={payslip.bonuses > 0 ? s.tableValueGreen : s.tableValue}>
            {payslip.bonuses > 0 ? `+ ${fmt(payslip.bonuses)}` : '—'} {payslip.bonuses > 0 ? 'FCFA' : ''}
          </Text>
        </View>

        <View style={s.tableRowAlt}>
          <Text style={s.tableLabel}>Retenues / Avances</Text>
          <Text style={payslip.deductions > 0 ? s.tableValueRed : s.tableValue}>
            {payslip.deductions > 0 ? `- ${fmt(payslip.deductions)}` : '—'} {payslip.deductions > 0 ? 'FCFA' : ''}
          </Text>
        </View>

        {/* Net à payer */}
        <View style={s.netRow}>
          <Text style={s.netLabel}>NET À PAYER</Text>
          <Text style={s.netValue}>{fmt(payslip.netSalary)} FCFA</Text>
        </View>

        {/* ── Notes ───────────────────────────────────────────────────────── */}
        {payslip.notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{payslip.notes}</Text>
          </View>
        )}

        {/* ── Signatures ──────────────────────────────────────────────────── */}
        <View style={s.signRow}>
          <View style={s.signBox}>
            <Text style={s.signLabel}>Signature de l'employeur</Text>
            <Text style={[s.signLabel, { marginTop: 30 }]}>Date et cachet</Text>
          </View>
          <View style={s.signBox}>
            <Text style={s.signLabel}>Signature de l'employé</Text>
            <Text style={[s.signLabel, { marginTop: 30, fontSize: 7, color: '#9ca3af' }]}>
              Lu et approuvé
            </Text>
          </View>
        </View>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <View style={s.footer}>
          <Text style={s.footerText}>{companyName}</Text>
          <Text style={s.footerText}>Bulletin de paie — {periodLabel} — {employeeName}</Text>
          <Text style={s.footerText}>Document confidentiel</Text>
        </View>

      </Page>
    </Document>
  );
}
