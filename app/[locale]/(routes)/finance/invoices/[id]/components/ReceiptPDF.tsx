import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Cabinet } from './InvoicePDF';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ─── Montant en lettres ───────────────────────────────────────────────────────

const UNITS = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function belowThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return UNITS[n];
  if (n < 100) {
    const t = Math.floor(n / 10), u = n % 10;
    if (t === 7 || t === 9) return TENS[t] + (u === 1 && t === 7 ? '-et-' : '-') + UNITS[10 + u];
    if (t === 8) return 'quatre-vingts' + (u > 0 ? '-' + UNITS[u] : '');
    return TENS[t] + (u === 1 && t < 8 ? '-et-un' : u > 0 ? '-' + UNITS[u] : '');
  }
  const h = Math.floor(n / 100), rest = n % 100;
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

const PM_LABELS: Record<string, string> = {
  ESPECES:  'Espèces',
  VIREMENT: 'Virement bancaire',
  FLOOZ:    'Flooz (Moov)',
  T_MONEY:  'T-Money (Togocel)',
};

// ─── Couleurs ─────────────────────────────────────────────────────────────────

const NAVY       = '#1E1D3D';
const ORANGE     = '#FF7E00';
const GRAY_LIGHT = '#f3f4f6';
const GRAY_MED   = '#d1d5db';
const GRAY_TEXT  = '#6b7280';
const TEXT       = '#111111';
const WHITE      = '#ffffff';
const GREEN      = '#16a34a';
const GREEN_LIGHT = '#f0fdf4';

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 28,
    paddingBottom: 90,
    paddingHorizontal: 38,
    color: TEXT,
  },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: ORANGE },

  /* ── EN-TÊTE (identique à InvoicePDF) ── */
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  logoBlock: { width: 115, alignItems: 'center', marginRight: 14 },
  logoImg: { width: 90, height: 62, objectFit: 'contain' },
  logoFallback: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: NAVY, marginTop: 4, textAlign: 'center' },
  companyInfoBlock: { flex: 1 },
  companyNameBig: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 7, letterSpacing: 0.5 },
  servicesBar: { borderLeftWidth: 3, borderLeftColor: ORANGE, paddingLeft: 8 },
  serviceLine: { fontSize: 7.5, color: '#374151', marginBottom: 1.5, lineHeight: 1.3 },
  headerDivider: { borderBottomWidth: 2, borderBottomColor: NAVY, marginTop: 6, marginBottom: 18 },

  /* ── TITRE REÇU ── */
  receiptTitleRow: { alignItems: 'center', marginBottom: 16 },
  receiptTitle: {
    fontSize: 18, fontFamily: 'Helvetica-Bold', color: NAVY,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  receiptSubtitle: { fontSize: 9, color: GRAY_TEXT, marginTop: 3 },

  /* ── BLOC REÇU ── */
  receiptCard: {
    borderWidth: 1, borderColor: NAVY,
    borderRadius: 3, overflow: 'hidden',
    marginBottom: 14,
  },
  receiptCardHeader: {
    backgroundColor: NAVY,
    paddingVertical: 7, paddingHorizontal: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  receiptCardHeaderText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: WHITE },
  receiptCardBody: { padding: 12 },

  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoKey: { fontSize: 8.5, color: GRAY_TEXT, width: 130 },
  infoVal: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: TEXT, flex: 1 },

  dividerThin: { borderBottomWidth: 0.5, borderBottomColor: GRAY_MED, marginVertical: 8 },

  /* ── MONTANT PRINCIPAL ── */
  amountBox: {
    borderWidth: 1.5, borderColor: GREEN,
    borderRadius: 4, backgroundColor: GREEN_LIGHT,
    paddingVertical: 12, paddingHorizontal: 16,
    alignItems: 'center', marginBottom: 14,
  },
  amountLabel: {
    fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: GREEN,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  amountValue: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: GREEN, marginBottom: 4 },
  amountWords: { fontSize: 8.5, color: GRAY_TEXT, fontStyle: 'italic', textAlign: 'center' },

  /* ── DÉCLARATION ── */
  declarationBox: {
    borderWidth: 1, borderColor: ORANGE,
    borderRadius: 3, backgroundColor: '#fff7ed',
    paddingVertical: 8, paddingHorizontal: 12,
    marginBottom: 14,
  },
  declarationText: { fontSize: 9, color: TEXT, lineHeight: 1.5, textAlign: 'center' },

  /* ── SOLDE ── */
  soldeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  soldeBox: { flex: 1, borderWidth: 1, borderColor: GRAY_MED, borderRadius: 3, padding: 10 },
  soldeBoxGreen: { flex: 1, borderWidth: 1, borderColor: GREEN, borderRadius: 3, padding: 10, backgroundColor: GREEN_LIGHT },
  soldeLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: GRAY_TEXT, letterSpacing: 0.5, marginBottom: 4 },
  soldeValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: TEXT },
  soldeValueGreen: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: GREEN },

  /* ── SIGNATURE ── */
  signatureZone: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  signatureBlock: { width: 170, borderTopWidth: 1, borderTopColor: GRAY_MED, paddingTop: 8, alignItems: 'center' },
  signatureLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 20 },
  signatureName:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TEXT, marginBottom: 2 },
  signatureTitle: { fontSize: 7.5, color: GRAY_TEXT },

  clientSigBlock: { width: 170, borderTopWidth: 1, borderTopColor: GRAY_MED, paddingTop: 8, alignItems: 'center' },
  clientSigLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 20 },

  /* ── PIED DE PAGE ── */
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: NAVY, paddingBottom: 10, paddingHorizontal: 38,
  },
  footerAccent: { height: 3, backgroundColor: ORANGE, marginBottom: 7 },
  footerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  footerLogoWrap: { width: 52, height: 28 },
  footerLogo: { width: 52, height: 28, objectFit: 'contain' },
  footerCompanyName: { flex: 1, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: WHITE, textAlign: 'center', letterSpacing: 0.8, textTransform: 'uppercase' },
  footerPageNum: { width: 52, textAlign: 'right', fontSize: 6.5, color: '#9ca3af' },
  footerDividerThin: { borderTopWidth: 0.5, borderTopColor: '#374151', marginBottom: 6 },
  footerColumns: { flexDirection: 'row', gap: 10 },
  footerCol: { flex: 1 },
  footerColCenter: { flex: 1, alignItems: 'center' },
  footerColRight: { flex: 1, alignItems: 'flex-end' },
  footerLabel: { fontSize: 6, fontFamily: 'Helvetica-Bold', color: ORANGE, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2.5 },
  footerValue: { fontSize: 7, color: '#d1d5db', marginBottom: 1.5, lineHeight: 1.3 },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReceiptData = {
  receiptNumber: string;
  paymentDate:   string;
  paymentMethod: string;
  amount:        number;
  notes:         string | null;
  invoice: {
    number:   string;
    totalTTC: number;
    totalPaid: number;
  };
  client: {
    name:    string;
    nif:     string | null;
    address: string | null;
  };
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function ReceiptPDF({ data, cabinet }: { data: ReceiptData; cabinet: Cabinet }) {
  const cabinetName  = cabinet?.company_name ?? 'KEKELI GROUP';
  const serviceLines = (cabinet?.services ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const signerName   = cabinet?.signer_name  ?? null;
  const signerTitle  = cabinet?.signer_title ?? null;

  const reste     = Math.max(0, data.invoice.totalTTC - data.invoice.totalPaid);
  const isSolde   = reste <= 0.01;

  return (
    <Document
      title={`Reçu ${data.receiptNumber}`}
      author={cabinetName}
      subject="Reçu de paiement"
    >
      <Page size="A4" style={s.page}>
        <View style={s.topBar} fixed />

        {/* ── EN-TÊTE ── */}
        <View style={s.header}>
          <View style={s.logoBlock}>
            {cabinet?.logoUrl
              ? <Image src={cabinet.logoUrl} style={s.logoImg} />
              : <Text style={s.logoFallback}>{cabinetName}</Text>}
          </View>
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
        <View style={s.headerDivider} />

        {/* ── TITRE ── */}
        <View style={s.receiptTitleRow}>
          <Text style={s.receiptTitle}>Reçu de Paiement</Text>
          <Text style={s.receiptSubtitle}>N° {data.receiptNumber}</Text>
        </View>

        {/* ── MONTANT ENCAISSÉ ── */}
        <View style={s.amountBox}>
          <Text style={s.amountLabel}>Montant encaissé</Text>
          <Text style={s.amountValue}>{fmt(data.amount)} FCFA</Text>
          <Text style={s.amountWords}>{amountToWords(data.amount)}</Text>
        </View>

        {/* ── DÉTAILS DU PAIEMENT ── */}
        <View style={s.receiptCard}>
          <View style={s.receiptCardHeader}>
            <Text style={s.receiptCardHeaderText}>Détails du paiement</Text>
            <Text style={s.receiptCardHeaderText}>{fmtDate(data.paymentDate)}</Text>
          </View>
          <View style={s.receiptCardBody}>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Reçu de :</Text>
              <Text style={s.infoVal}>{data.client.name}</Text>
            </View>
            {data.client.nif && (
              <View style={s.infoRow}>
                <Text style={s.infoKey}>NIF client :</Text>
                <Text style={s.infoVal}>{data.client.nif}</Text>
              </View>
            )}
            {data.client.address && (
              <View style={s.infoRow}>
                <Text style={s.infoKey}>Adresse :</Text>
                <Text style={s.infoVal}>{data.client.address}</Text>
              </View>
            )}
            <View style={s.dividerThin} />
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Référence facture :</Text>
              <Text style={s.infoVal}>{data.invoice.number}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Mode de paiement :</Text>
              <Text style={s.infoVal}>{PM_LABELS[data.paymentMethod] ?? data.paymentMethod}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Date de réception :</Text>
              <Text style={s.infoVal}>{fmtDate(data.paymentDate)}</Text>
            </View>
            {data.notes && (
              <View style={s.infoRow}>
                <Text style={s.infoKey}>Note :</Text>
                <Text style={s.infoVal}>{data.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── ÉTAT DU RÈGLEMENT ── */}
        <View style={s.soldeRow}>
          <View style={s.soldeBox}>
            <Text style={s.soldeLabel}>Total facture</Text>
            <Text style={s.soldeValue}>{fmt(data.invoice.totalTTC)} FCFA</Text>
          </View>
          <View style={s.soldeBox}>
            <Text style={s.soldeLabel}>Total encaissé</Text>
            <Text style={s.soldeValue}>{fmt(data.invoice.totalPaid)} FCFA</Text>
          </View>
          <View style={isSolde ? s.soldeBoxGreen : s.soldeBox}>
            <Text style={s.soldeLabel}>{isSolde ? 'Facture soldée' : 'Reste à payer'}</Text>
            <Text style={isSolde ? s.soldeValueGreen : s.soldeValue}>
              {isSolde ? '✓ Soldée' : `${fmt(reste)} FCFA`}
            </Text>
          </View>
        </View>

        {/* ── DÉCLARATION ── */}
        <View style={s.declarationBox}>
          <Text style={s.declarationText}>
            {cabinetName} certifie avoir bien reçu la somme de{' '}
            <Text style={{ fontFamily: 'Helvetica-Bold', color: NAVY }}>
              {amountToWords(data.amount)}
            </Text>
            {' '}en règlement {isSolde ? 'total' : 'partiel'} de la facture N° {data.invoice.number}.
          </Text>
        </View>

        {/* ── SIGNATURES ── */}
        <View style={s.signatureZone}>
          <View style={s.clientSigBlock}>
            <Text style={s.clientSigLabel}>Signature du client</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={s.signatureLabel}>Le Responsable</Text>
            {signerName  && <Text style={s.signatureName}>{signerName}</Text>}
            {signerTitle && <Text style={s.signatureTitle}>{signerTitle}</Text>}
          </View>
        </View>

        {/* ── PIED DE PAGE ── */}
        <View style={s.footer} fixed>
          <View style={s.footerAccent} />
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
          <View style={s.footerDividerThin} />
          <View style={s.footerColumns}>
            <View style={s.footerCol}>
              <Text style={s.footerLabel}>Adresse</Text>
              {cabinet?.street && <Text style={s.footerValue}>{cabinet.street}</Text>}
              <Text style={s.footerValue}>{cabinet?.city ?? 'Lomé'} — Togo</Text>
            </View>
            <View style={s.footerColCenter}>
              <Text style={s.footerLabel}>Identifiants fiscaux</Text>
              {cabinet?.VAT_number && <Text style={s.footerValue}>NIF : {cabinet.VAT_number}</Text>}
              {cabinet?.TAX_number && <Text style={s.footerValue}>RCCM : {cabinet.TAX_number}</Text>}
            </View>
            <View style={s.footerColRight}>
              <Text style={s.footerLabel}>Contact</Text>
              {cabinet?.phone   && <Text style={s.footerValue}>Tél : {cabinet.phone}</Text>}
              {cabinet?.mobile  && <Text style={s.footerValue}>Mob : {cabinet.mobile}</Text>}
              {cabinet?.email   && <Text style={s.footerValue}>{cabinet.email}</Text>}
              {cabinet?.website && <Text style={s.footerValue}>{cabinet.website}</Text>}
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
