import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Montant en lettres (français, FCFA) ──────────────────────────────────────

const UNITS = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS  = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function belowThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return UNITS[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) return TENS[t] + (u === 1 && t === 7 ? '-et-' : '-') + UNITS[10 + u];
    if (t === 8) return 'quatre-vingts' + (u > 0 ? '-' + UNITS[u] : '');
    return TENS[t] + (u === 1 && t < 8 ? '-et-un' : u > 0 ? '-' + UNITS[u] : '');
  }
  const h    = Math.floor(n / 100);
  const rest = n % 100;
  const prefix = (h === 1 ? 'cent' : UNITS[h] + ' cent') + (rest === 0 && h > 1 ? 's' : '');
  return rest === 0 ? prefix : prefix + ' ' + belowThousand(rest);
}

function amountToWords(amount: number): string {
  const n = Math.round(amount);
  if (n === 0) return 'Zéro franc CFA';
  const millions  = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;
  const parts: string[] = [];
  if (millions  > 0) parts.push(millions  === 1 ? 'un million'  : belowThousand(millions)  + ' millions');
  if (thousands > 0) parts.push(thousands === 1 ? 'mille'       : belowThousand(thousands) + ' mille');
  if (remainder > 0) parts.push(belowThousand(remainder));
  const words = parts.join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1) + ' franc' + (n > 1 ? 's' : '') + ' CFA';
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  FACTURE: 'FACTURE',
  DEVIS:   'DEVIS / PRO FORMA',
  AVOIR:   'AVOIR (NOTE DE CRÉDIT)',
};

// ─── Couleurs ─────────────────────────────────────────────────────────────────

const NAVY        = '#1E1D3D';
const ORANGE      = '#FF7E00';
const GRAY_LIGHT  = '#f3f4f6';
const GRAY_MED    = '#d1d5db';
const GRAY_TEXT   = '#6b7280';
const TEXT        = '#111111';
const WHITE       = '#ffffff';

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 28,
    paddingBottom: 95,
    paddingHorizontal: 38,
    color: TEXT,
  },

  /* ── BANDE ACCENT HAUT ── */
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 5,
    backgroundColor: ORANGE,
  },

  /* ── EN-TÊTE ── */
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },

  logoBlock: { width: 115, alignItems: 'center', marginRight: 14 },
  logoImg: { width: 90, height: 62, objectFit: 'contain' },
  logoFallback: {
    fontSize: 12, fontFamily: 'Helvetica-Bold', color: NAVY,
    marginTop: 4, textAlign: 'center',
  },

  companyInfoBlock: { flex: 1 },
  companyNameBig: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 7,
    letterSpacing: 0.5,
  },
  servicesBar: {
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
    paddingLeft: 8,
  },
  serviceLine: { fontSize: 7.5, color: '#374151', marginBottom: 1.5, lineHeight: 1.3 },

  /* Séparateur navy pleine largeur */
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    marginTop: 6,
    marginBottom: 14,
  },

  /* ── CLIENT / DOCUMENT ROW ── */
  clientDocRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 14,
    alignItems: 'flex-start',
  },

  clientBlock: { flex: 1, paddingTop: 2 },
  clientRow: { flexDirection: 'row', marginBottom: 5 },
  clientKey: { fontSize: 9, color: TEXT, width: 60 },
  clientValBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 },
  clientValNormal: { fontSize: 9, color: TEXT, flex: 1 },

  docBoxWrap: { width: 215 },
  docBoxTitle: {
    borderWidth: 1,
    borderColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: GRAY_LIGHT,
  },
  docBoxTitleText: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  docBoxTitleNum: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginTop: 2,
  },
  docBoxDetails: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: NAVY,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  docBoxRow: { flexDirection: 'row', marginBottom: 3 },
  docBoxKey: { fontSize: 8, color: GRAY_TEXT, width: 95 },
  docBoxVal: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: TEXT, flex: 1 },

  /* Badge devis */
  badgeProforma: {
    marginTop: 4,
    borderWidth: 1, borderColor: ORANGE,
    paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor: '#fff7ed',
  },
  badgeProformaText: { fontSize: 7, color: ORANGE, fontFamily: 'Helvetica-Bold' },

  /* ── RÉFÉRENCE AVOIR ── */
  avoirRef: {
    backgroundColor: '#fff1f2',
    borderLeftWidth: 3, borderLeftColor: '#e11d48',
    paddingHorizontal: 10, paddingVertical: 6,
    marginBottom: 10, borderRadius: 2,
  },
  avoirRefText: { fontSize: 8, color: '#be123c', fontFamily: 'Helvetica-Bold' },

  /* ── TABLEAU ── */
  tableWrap: {
    borderWidth: 1,
    borderColor: NAVY,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: WHITE,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: GRAY_MED,
    paddingVertical: 6, paddingHorizontal: 6,
    minHeight: 24,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: GRAY_MED,
    paddingVertical: 6, paddingHorizontal: 6,
    backgroundColor: '#fafafa',
    minHeight: 24,
  },

  colDesig: { flex: 4 },
  colQty:   { flex: 1, textAlign: 'center' },
  colPU:    { flex: 2, textAlign: 'right' },
  colHT:    { flex: 2, textAlign: 'right' },
  colTTC:   { flex: 2, textAlign: 'right' },

  /* Lignes de total intégrées dans le tableau */
  tableSumRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: NAVY,
    paddingVertical: 5, paddingHorizontal: 6,
    backgroundColor: '#f9fafb',
  },
  tableSumLabel: {
    flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', color: TEXT, textAlign: 'center',
  },
  tableSumValue: {
    width: 120, textAlign: 'right',
    fontSize: 8, fontFamily: 'Helvetica-Bold', color: TEXT,
  },
  tableTvaRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: GRAY_MED,
    paddingVertical: 4, paddingHorizontal: 6,
  },
  tableTvaLabel: { flex: 1, fontSize: 7.5, color: GRAY_TEXT, textAlign: 'center' },
  tableTvaValue: { width: 120, textAlign: 'right', fontSize: 7.5, color: GRAY_TEXT },
  tvaExoText: {
    fontSize: 7.5, color: GRAY_TEXT, fontStyle: 'italic',
    textAlign: 'center',
    borderTopWidth: 1, borderTopColor: GRAY_MED,
    paddingVertical: 5, paddingHorizontal: 6,
  },
  tableGrandTotalRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5, borderTopColor: NAVY,
    paddingVertical: 7, paddingHorizontal: 6,
    backgroundColor: GRAY_LIGHT,
  },
  tableGrandTotalLabel: {
    flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', color: NAVY, textAlign: 'center',
  },
  tableGrandTotalValue: {
    width: 120, textAlign: 'right',
    fontSize: 12, fontFamily: 'Helvetica-Bold', color: NAVY,
  },
  tableWordsRow: {
    borderTopWidth: 1, borderTopColor: NAVY,
    paddingVertical: 6, paddingHorizontal: 8,
  },
  tableWordsText: { fontSize: 8.5, color: TEXT },

  /* ── CONDITIONS DE RÈGLEMENT ── */
  conditionsBlock: {
    marginTop: 10, borderWidth: 1, borderColor: GRAY_MED,
    borderRadius: 2, overflow: 'hidden',
  },
  conditionsTitle: { backgroundColor: GRAY_LIGHT, paddingVertical: 4, paddingHorizontal: 8 },
  conditionsTitleText: {
    fontSize: 7, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', color: GRAY_TEXT, letterSpacing: 0.5,
  },
  conditionsContent: { padding: 8 },
  conditionLine: { fontSize: 7.5, color: '#374151', marginBottom: 2 },
  penaltyClause: {
    marginTop: 5, fontSize: 7, color: GRAY_TEXT,
    fontStyle: 'italic', lineHeight: 1.4,
  },

  /* ── NOTES ── */
  notesBlock: {
    marginTop: 10, padding: 9,
    backgroundColor: '#fafafa',
    borderWidth: 1, borderColor: GRAY_LIGHT, borderRadius: 2,
  },
  notesTitle: {
    fontSize: 7, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', color: GRAY_TEXT, marginBottom: 4, letterSpacing: 0.5,
  },
  noteText: { fontSize: 8, color: '#374151', lineHeight: 1.4 },

  /* ── SIGNATURE ── */
  signatureZone: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  signatureBlock: {
    width: 190,
    borderTopWidth: 1, borderTopColor: GRAY_MED,
    paddingTop: 8,
    alignItems: 'center',
  },
  signatureLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 20 },
  signatureName:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TEXT, marginBottom: 2 },
  signatureTitle: { fontSize: 7.5, color: GRAY_TEXT },

  /* ── PIED DE PAGE ── */
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: NAVY,
    paddingBottom: 10, paddingHorizontal: 38,
  },
  footerAccent: { height: 3, backgroundColor: ORANGE, marginBottom: 7 },
  footerTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 5,
  },
  footerLogoWrap: { width: 52, height: 28 },
  footerLogo: { width: 52, height: 28, objectFit: 'contain' },
  footerCompanyName: {
    flex: 1, fontSize: 8.5, fontFamily: 'Helvetica-Bold',
    color: WHITE, textAlign: 'center', letterSpacing: 0.8, textTransform: 'uppercase',
  },
  footerPageNum: { width: 52, textAlign: 'right', fontSize: 6.5, color: '#9ca3af' },
  footerDividerThin: { borderTopWidth: 0.5, borderTopColor: '#374151', marginBottom: 6 },
  footerColumns: { flexDirection: 'row', gap: 10 },
  footerCol:        { flex: 1 },
  footerColCenter:  { flex: 1, alignItems: 'center' },
  footerColRight:   { flex: 1, alignItems: 'flex-end' },
  footerLabel: {
    fontSize: 6, fontFamily: 'Helvetica-Bold', color: ORANGE,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2.5,
  },
  footerValue: { fontSize: 7, color: '#d1d5db', marginBottom: 1.5, lineHeight: 1.3 },
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Line = {
  position: number;
  designation: string;
  quantity: number;
  unitPrice: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
};

export type Cabinet = {
  company_name: string;
  VAT_number:   string;
  TAX_number:   string | null;
  street:       string | null;
  city:         string | null;
  phone:        string | null;
  mobile:       string | null;
  email:        string | null;
  website:      string | null;
  services:     string | null;
  logoUrl:      string | null;
  signer_name?:  string | null;
  signer_title?: string | null;
} | null;

export type DocData = {
  number:    string;
  type:      string;
  issueDate: string;
  dueDate:   string | null;
  tvaRegime: string;
  tvaRate:   number;
  totalHT:   number;
  totalTVA:  number;
  totalTTC:  number;
  notes:     string | null;
  lines:     Line[];
  crmAccount: {
    name:           string;
    nif:            string | null;
    rccm?:          string | null;
    billing_street: string | null;
    billing_city:   string | null;
  } | null;
  occasionalClient: {
    name:    string;
    nif:     string | null;
    phone:   string | null;
    email:   string | null;
    address: string | null;
    city:    string | null;
  } | null;
  creditedInvoiceNumber?: string | null;
  creditedInvoiceDate?:   string | null;
  creditNoteMode?:        string | null;
  creditNoteMotif?:       string | null;
  quoteNumber?:           string | null;
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function InvoicePDF({ doc, cabinet }: { doc: DocData; cabinet: Cabinet }) {
  const cabinetName = cabinet?.company_name ?? 'KEKELI GROUP';
  const isDevis     = doc.type === 'DEVIS';
  const isAvoir     = doc.type === 'AVOIR';
  const isFacture   = doc.type === 'FACTURE';

  const clientName    = doc.crmAccount?.name ?? doc.occasionalClient?.name ?? '—';
  const clientNif     = doc.crmAccount?.nif  ?? doc.occasionalClient?.nif;
  const clientRccm    = doc.crmAccount?.rccm;
  const clientAddress = doc.crmAccount
    ? [doc.crmAccount.billing_street, doc.crmAccount.billing_city].filter(Boolean).join(', ')
    : [doc.occasionalClient?.address, doc.occasionalClient?.city].filter(Boolean).join(', ');
  const clientPhone = doc.occasionalClient?.phone;
  const clientEmail = doc.occasionalClient?.email;

  const serviceLines = (cabinet?.services ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const signerName   = cabinet?.signer_name  ?? null;
  const signerTitle  = cabinet?.signer_title ?? null;

  return (
    <Document
      title={doc.number}
      author={cabinetName}
      subject={TYPE_LABELS[doc.type] ?? doc.type}
    >
      <Page size="A4" style={s.page}>

        {/* Bande orange top */}
        <View style={s.topBar} fixed />

        {/* ══════════════════════════════════════════════════
            EN-TÊTE : Logo gauche · Nom + Services droite
        ══════════════════════════════════════════════════ */}
        <View style={s.header}>
          {/* Logo */}
          <View style={s.logoBlock}>
            {cabinet?.logoUrl
              ? <Image src={cabinet.logoUrl} style={s.logoImg} />
              : <Text style={s.logoFallback}>{cabinetName}</Text>}
          </View>

          {/* Nom + services */}
          <View style={s.companyInfoBlock}>
            <Text style={s.companyNameBig}>{cabinetName}</Text>
            {serviceLines.length > 0 && (
              <View style={s.servicesBar}>
                {serviceLines.map((line, i) => (
                  <Text key={i} style={s.serviceLine}>{line}</Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Ligne navy pleine largeur */}
        <View style={s.headerDivider} />

        {/* ══════════════════════════════════════════════════
            RÉFÉRENCE AVOIR
        ══════════════════════════════════════════════════ */}
        {isAvoir && doc.creditedInvoiceNumber && (
          <View style={s.avoirRef}>
            <Text style={s.avoirRefText}>
              Note de crédit en référence à la facture N° {doc.creditedInvoiceNumber}
              {doc.creditedInvoiceDate ? ` du ${fmtDate(doc.creditedInvoiceDate)}` : ''}
              {doc.creditNoteMode === 'TOTAL'   ? ' — Remboursement TOTAL'   : ''}
              {doc.creditNoteMode === 'PARTIEL' ? ' — Remboursement PARTIEL' : ''}
            </Text>
            {doc.creditNoteMotif && (
              <Text style={[s.avoirRefText, { fontFamily: 'Helvetica', marginTop: 3 }]}>
                Motif : {doc.creditNoteMotif}
              </Text>
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════
            CLIENT (gauche) · BOÎTE DOCUMENT (droite)
        ══════════════════════════════════════════════════ */}
        <View style={s.clientDocRow}>

          {/* Client */}
          <View style={s.clientBlock}>
            <View style={s.clientRow}>
              <Text style={s.clientKey}>Due par :</Text>
              <Text style={s.clientValBold}>{clientName}</Text>
            </View>
            {clientAddress ? (
              <View style={s.clientRow}>
                <Text style={s.clientKey}>Adresse :</Text>
                <Text style={s.clientValNormal}>{clientAddress}</Text>
              </View>
            ) : null}
            {clientNif ? (
              <View style={s.clientRow}>
                <Text style={s.clientKey}>NIF :</Text>
                <Text style={s.clientValBold}>{clientNif}</Text>
              </View>
            ) : null}
            {clientRccm ? (
              <View style={s.clientRow}>
                <Text style={s.clientKey}>RCCM :</Text>
                <Text style={s.clientValNormal}>{clientRccm}</Text>
              </View>
            ) : null}
            {clientPhone ? (
              <View style={s.clientRow}>
                <Text style={s.clientKey}>Tél :</Text>
                <Text style={s.clientValNormal}>{clientPhone}</Text>
              </View>
            ) : null}
            {clientEmail ? (
              <View style={s.clientRow}>
                <Text style={s.clientKey}>Email :</Text>
                <Text style={s.clientValNormal}>{clientEmail}</Text>
              </View>
            ) : null}
          </View>

          {/* Boîte document */}
          <View style={s.docBoxWrap}>
            <View style={s.docBoxTitle}>
              <Text style={s.docBoxTitleText}>{TYPE_LABELS[doc.type] ?? doc.type}</Text>
              <Text style={s.docBoxTitleNum}>N° : {doc.number}</Text>
              {isDevis && (
                <View style={s.badgeProforma}>
                  <Text style={s.badgeProformaText}>PRO FORMA — NON CONTRACTUEL</Text>
                </View>
              )}
            </View>
            <View style={s.docBoxDetails}>
              <View style={s.docBoxRow}>
                <Text style={s.docBoxKey}>Date :</Text>
                <Text style={s.docBoxVal}>{fmtDate(doc.issueDate)}</Text>
              </View>
              <View style={s.docBoxRow}>
                <Text style={s.docBoxKey}>Numéro Fac. :</Text>
                <Text style={s.docBoxVal}>{doc.number}</Text>
              </View>
              <View style={s.docBoxRow}>
                <Text style={s.docBoxKey}>Date d'échéance :</Text>
                <Text style={s.docBoxVal}>{doc.dueDate ? fmtDate(doc.dueDate) : '—'}</Text>
              </View>
              {doc.quoteNumber && (
                <View style={s.docBoxRow}>
                  <Text style={s.docBoxKey}>Réf. devis :</Text>
                  <Text style={s.docBoxVal}>{doc.quoteNumber}</Text>
                </View>
              )}
              <View style={s.docBoxRow}>
                <Text style={s.docBoxKey}>Total à payer :</Text>
                <Text style={s.docBoxVal}>{fmt(doc.totalTTC)} F CFA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            TABLEAU DES PRESTATIONS (avec totaux intégrés)
        ══════════════════════════════════════════════════ */}
        <View style={s.tableWrap}>

          {/* En-tête */}
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, s.colDesig]}>Désignations</Text>
            <Text style={[s.tableHeaderCell, s.colQty]}>Qté / Jour</Text>
            <Text style={[s.tableHeaderCell, s.colPU]}>Coût unitaire</Text>
            <Text style={[s.tableHeaderCell, s.colHT]}>Montant HT</Text>
            <Text style={[s.tableHeaderCell, s.colTTC]}>Total TTC</Text>
          </View>

          {/* Lignes */}
          {doc.lines.map((line, i) => (
            <View key={line.position} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={s.colDesig}>{line.designation}</Text>
              <Text style={s.colQty}>{line.quantity}</Text>
              <Text style={s.colPU}>{fmt(line.unitPrice)}</Text>
              <Text style={s.colHT}>{fmt(line.totalHT)}</Text>
              <Text style={s.colTTC}>{fmt(line.totalTTC)}</Text>
            </View>
          ))}

          {/* MONTANT BRUT */}
          <View style={s.tableSumRow}>
            <Text style={s.tableSumLabel}>Montant Brut</Text>
            <Text style={s.tableSumValue}>{fmt(doc.totalHT)}</Text>
          </View>

          {/* TVA (si régime normal) */}
          {doc.tvaRegime === 'NORMAL' && (
            <View style={s.tableTvaRow}>
              <Text style={s.tableTvaLabel}>TVA ({doc.tvaRate} %)</Text>
              <Text style={s.tableTvaValue}>{fmt(doc.totalTVA)}</Text>
            </View>
          )}
          {doc.tvaRegime === 'EXONERE' && (
            <Text style={s.tvaExoText}>Exonéré de TVA (ONG / Hôpital / Association agréée)</Text>
          )}
          {doc.tvaRegime === 'TPU' && (
            <Text style={s.tvaExoText}>TVA non applicable — Régime TPU, client non assujetti</Text>
          )}

          {/* TOTAL NET À PAYER */}
          <View style={s.tableGrandTotalRow}>
            <Text style={s.tableGrandTotalLabel}>Total Net À Payer</Text>
            <Text style={s.tableGrandTotalValue}>{fmt(doc.totalTTC)}</Text>
          </View>

          {/* Montant en lettres */}
          <View style={s.tableWordsRow}>
            <Text style={s.tableWordsText}>
              Arrêter la présente {TYPE_LABELS[doc.type]?.toLowerCase() ?? 'facture'} à la somme de :{' '}
              <Text style={{ fontFamily: 'Helvetica-Bold', color: NAVY }}>
                {amountToWords(doc.totalTTC)}
              </Text>
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            CONDITIONS DE RÈGLEMENT
        ══════════════════════════════════════════════════ */}
        {(isFacture || isAvoir) && (
          <View style={s.conditionsBlock}>
            <View style={s.conditionsTitle}>
              <Text style={s.conditionsTitleText}>Conditions de règlement</Text>
            </View>
            <View style={s.conditionsContent}>
              {doc.dueDate && (
                <Text style={s.conditionLine}>Date d'échéance : {fmtDate(doc.dueDate)}</Text>
              )}
              <Text style={s.conditionLine}>
                Modes acceptés : Virement bancaire · Espèces · Flooz · T-Money
              </Text>
              {isFacture && (
                <Text style={s.penaltyClause}>
                  Tout retard de paiement pourra entraîner l'application de pénalités de retard
                  calculées à compter de la date d'échéance, conformément aux dispositions de
                  l'Acte Uniforme OHADA relatif au droit commercial général.
                  TVA facturée conformément à la Dir. 02/98/CM/UEMOA — Taux applicable : 18%.
                </Text>
              )}
              {isAvoir && (
                <Text style={s.conditionLine}>
                  Ce document annule et remplace, en tout ou partie, la facture référencée ci-dessus.
                </Text>
              )}
            </View>
          </View>
        )}

        {isDevis && (
          <View style={s.conditionsBlock}>
            <View style={s.conditionsTitle}>
              <Text style={s.conditionsTitleText}>Validité du devis</Text>
            </View>
            <View style={s.conditionsContent}>
              <Text style={s.conditionLine}>
                Ce devis est valable 30 jours à compter de sa date d'émission ({fmtDate(doc.issueDate)}).
              </Text>
              <Text style={s.conditionLine}>
                Document non contractuel – Pro forma. Il ne constitue pas une facture.
              </Text>
              <Text style={s.conditionLine}>
                Modes de règlement : Virement bancaire · Espèces · Flooz · T-Money
              </Text>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════
            NOTES
        ══════════════════════════════════════════════════ */}
        {doc.notes && (
          <View style={s.notesBlock}>
            <Text style={s.notesTitle}>Notes / Conditions particulières</Text>
            <Text style={s.noteText}>{doc.notes}</Text>
          </View>
        )}

        {/* ══════════════════════════════════════════════════
            SIGNATURE
        ══════════════════════════════════════════════════ */}
        <View style={s.signatureZone}>
          <View style={s.signatureBlock}>
            <Text style={s.signatureLabel}>Le Responsable</Text>
            {signerName  && <Text style={s.signatureName}>{signerName}</Text>}
            {signerTitle && <Text style={s.signatureTitle}>{signerTitle}</Text>}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            PIED DE PAGE (fixe, toutes pages)
        ══════════════════════════════════════════════════ */}
        <View style={s.footer} fixed>
          {/* Bandeau orange */}
          <View style={s.footerAccent} />

          {/* Logo · Nom cabinet · Numéro de page */}
          <View style={s.footerTopRow}>
            <View style={s.footerLogoWrap}>
              {cabinet?.logoUrl && <Image src={cabinet.logoUrl} style={s.footerLogo} />}
            </View>
            <Text style={s.footerCompanyName}>{cabinetName}</Text>
            <Text
              style={s.footerPageNum}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
            />
          </View>

          {/* Séparateur fin */}
          <View style={s.footerDividerThin} />

          {/* 3 colonnes : Adresse · Identifiants fiscaux · Contact */}
          <View style={s.footerColumns}>
            <View style={s.footerCol}>
              <Text style={s.footerLabel}>Adresse</Text>
              {cabinet?.street && <Text style={s.footerValue}>{cabinet.street}</Text>}
              <Text style={s.footerValue}>{cabinet?.city ?? 'Lomé'} — Togo</Text>
            </View>
            <View style={s.footerColCenter}>
              <Text style={s.footerLabel}>Identifiants fiscaux</Text>
              {cabinet?.VAT_number && (
                <Text style={s.footerValue}>NIF : {cabinet.VAT_number}</Text>
              )}
              {cabinet?.TAX_number && (
                <Text style={s.footerValue}>RCCM : {cabinet.TAX_number}</Text>
              )}
              <Text style={s.footerValue}>Assujetti TVA — Dir. 02/98/CM/UEMOA</Text>
            </View>
            <View style={s.footerColRight}>
              <Text style={s.footerLabel}>Contact</Text>
              {cabinet?.phone   && <Text style={s.footerValue}>Tél : {cabinet.phone}</Text>}
              {cabinet?.mobile  && <Text style={s.footerValue}>Mob : {cabinet.mobile}</Text>}
              {cabinet?.email   && <Text style={s.footerValue}>{cabinet.email}</Text>}
              {cabinet?.website && <Text style={s.footerValue}>{cabinet.website}</Text>}
            </View>
          </View>
          {/* Mention légale OHADA */}
          <View style={{ marginTop: 5, borderTopWidth: 0.5, borderTopColor: '#374151', paddingTop: 4 }}>
            <Text style={{ fontSize: 5.5, color: '#9ca3af', textAlign: 'center' }}>
              Document établi conformément à l'Acte Uniforme OHADA relatif au droit commercial général
              et à la Directive 02/98/CM/UEMOA portant harmonisation des législations en matière de TVA (18%).
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
