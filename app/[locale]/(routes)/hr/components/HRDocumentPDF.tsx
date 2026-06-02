import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const NAVY       = '#1e3a5f';
const GRAY_LIGHT = '#f3f4f6';
const GRAY_MED   = '#d1d5db';
const GRAY_TEXT  = '#6b7280';
const TEXT       = '#111111';
const WHITE      = '#ffffff';

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  logo:   { width: 60, height: 60, objectFit: 'contain' },
  companyBlock: { flex: 1, paddingLeft: 12 },
  companyName:  { fontSize: 14, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 3 },
  companyInfo:  { fontSize: 8, color: GRAY_TEXT, lineHeight: 1.6 },
  titleBlock:   { alignItems: 'flex-end' },
  docTitle:     { fontSize: 15, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4, textAlign: 'right' },
  refText:      { fontSize: 8, color: GRAY_TEXT },
  dividerDark:  { height: 2, backgroundColor: NAVY, marginVertical: 12 },
  divider:      { height: 1, backgroundColor: GRAY_MED, marginVertical: 10 },
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    backgroundColor: NAVY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body:         { fontSize: 11, lineHeight: 2, color: TEXT, marginVertical: 20, textAlign: 'justify' },
  bold:         { fontFamily: 'Helvetica-Bold' },
  highlight:    {
    backgroundColor: GRAY_LIGHT,
    padding: 12,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: NAVY,
  },
  highlightText: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: NAVY },
  infoRow:    { flexDirection: 'row', marginBottom: 8 },
  infoLabel:  { width: 160, fontSize: 9, color: GRAY_TEXT, textTransform: 'uppercase' },
  infoValue:  { flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold', color: TEXT },
  signRow:    { flexDirection: 'row', marginTop: 50, gap: 30 },
  signBox:    { flex: 1, borderTopWidth: 1, borderTopColor: GRAY_MED, paddingTop: 8 },
  signLabel:  { fontSize: 8, color: GRAY_TEXT },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: GRAY_LIGHT,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: GRAY_TEXT },
  stamp: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 4,
    padding: 10,
    alignSelf: 'flex-start',
  },
  stampText: { fontSize: 8, color: NAVY, fontFamily: 'Helvetica-Bold' },
});

// ─── Types ────────────────────────────────────────────────────────────────────
type Employee = {
  firstName:  string;
  lastName:   string;
  position?:  string | null;
  salary:     number;
  onBoarding?: Date | string | null;
  address?:   string | null;
  taxid?:     string | null;
};

type Cabinet = {
  company_name: string | null;
  VAT_number:   string | null;
  TAX_number:   string | null;
  street:       string | null;
  city:         string | null;
  phone:        string | null;
  email:        string | null;
  logoUrl:      string | null;
} | null;

type Props = {
  documentType: string;
  employee:     Employee;
  cabinet:      Cabinet;
  issueDate:    string;
  requestId:    string;
};

function fmt(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return '—';
  try { return format(new Date(d), 'dd MMMM yyyy', { locale: fr }); } catch { return String(d); }
}

const DOC_TITLES: Record<string, string> = {
  attestation_travail: 'ATTESTATION DE TRAVAIL',
  attestation_salaire: 'ATTESTATION DE SALAIRE',
  certificat_travail:  'CERTIFICAT DE TRAVAIL',
};

// ─── En-tête commun ───────────────────────────────────────────────────────────
function Header({ cabinet, docType, ref_, issueDate }: { cabinet: Cabinet; docType: string; ref_: string; issueDate: string }) {
  const companyName = cabinet?.company_name ?? 'ENTREPRISE';
  return (
    <>
      <View style={s.header}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          {cabinet?.logoUrl && <Image src={cabinet.logoUrl} style={s.logo} />}
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{companyName}</Text>
            {cabinet?.VAT_number && <Text style={s.companyInfo}>NIF : {cabinet.VAT_number}</Text>}
            {cabinet?.TAX_number && <Text style={s.companyInfo}>RCCM : {cabinet.TAX_number}</Text>}
            {(cabinet?.street || cabinet?.city) && (
              <Text style={s.companyInfo}>{[cabinet.street, cabinet.city].filter(Boolean).join(', ')}</Text>
            )}
            {cabinet?.phone && <Text style={s.companyInfo}>Tél : {cabinet.phone}</Text>}
            {cabinet?.email && <Text style={s.companyInfo}>{cabinet.email}</Text>}
          </View>
        </View>
        <View style={s.titleBlock}>
          <Text style={s.docTitle}>{DOC_TITLES[docType] ?? docType.toUpperCase()}</Text>
          <Text style={s.refText}>Réf : {ref_}</Text>
          <Text style={[s.refText, { marginTop: 3 }]}>Date : {issueDate}</Text>
        </View>
      </View>
      <View style={s.dividerDark} />
    </>
  );
}

// ─── Attestation de travail ───────────────────────────────────────────────────
function AttestationTravail({ employee, cabinet, issueDate, requestId }: Omit<Props, 'documentType'>) {
  const companyName = cabinet?.company_name ?? 'l\'entreprise';
  const city        = cabinet?.city ?? 'Lomé';
  const employeeName = `${employee.firstName} ${employee.lastName}`;
  const ref_ = `ATT-${requestId.slice(0, 8).toUpperCase()}`;

  return (
    <Document title={`Attestation de travail — ${employeeName}`}>
      <Page size="A4" style={s.page}>
        <Header cabinet={cabinet} docType="attestation_travail" ref_={ref_} issueDate={issueDate} />

        <Text style={s.sectionLabel}>Informations sur l'employé</Text>
        <View style={s.infoRow}><Text style={s.infoLabel}>Nom et prénom</Text><Text style={s.infoValue}>{employeeName}</Text></View>
        {employee.position && <View style={s.infoRow}><Text style={s.infoLabel}>Poste / Fonction</Text><Text style={s.infoValue}>{employee.position}</Text></View>}
        {employee.onBoarding && <View style={s.infoRow}><Text style={s.infoLabel}>Date d'entrée</Text><Text style={s.infoValue}>{fmtDate(employee.onBoarding)}</Text></View>}
        {employee.address && <View style={s.infoRow}><Text style={s.infoLabel}>Adresse</Text><Text style={s.infoValue}>{employee.address}</Text></View>}

        <View style={s.divider} />

        <Text style={s.body}>
          {`Je soussigné(e), représentant légal de la société `}
          <Text style={s.bold}>{companyName}</Text>
          {`, atteste par la présente que `}
          <Text style={s.bold}>{employeeName}</Text>
          {employee.position ? `, occupant le poste de ` : ''}
          {employee.position ? <Text style={s.bold}>{employee.position}</Text> : ''}
          {`, fait partie de nos effectifs`}
          {employee.onBoarding ? ` depuis le ` : ''}
          {employee.onBoarding ? <Text style={s.bold}>{fmtDate(employee.onBoarding)}</Text> : ''}
          {`.`}
          {`\n\nCette attestation est délivrée à l'intéressé(e) sur sa demande, pour servir et valoir ce que de droit.`}
        </Text>

        <View style={s.highlight}>
          <Text style={s.highlightText}>{employeeName}</Text>
          {employee.position && <Text style={{ fontSize: 9, color: GRAY_TEXT, marginTop: 2 }}>{employee.position}</Text>}
        </View>

        <View style={s.signRow}>
          <View style={s.signBox}>
            <Text style={s.signLabel}>Fait à {city}, le {issueDate}</Text>
            <Text style={[s.signLabel, { marginTop: 40 }]}>Signature et cachet de l'employeur</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>{companyName}</Text>
          <Text style={s.footerText}>Attestation de travail — {ref_}</Text>
          <Text style={s.footerText}>Document officiel</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Attestation de salaire ───────────────────────────────────────────────────
function AttestationSalaire({ employee, cabinet, issueDate, requestId }: Omit<Props, 'documentType'>) {
  const companyName  = cabinet?.company_name ?? 'l\'entreprise';
  const city         = cabinet?.city ?? 'Lomé';
  const employeeName = `${employee.firstName} ${employee.lastName}`;
  const ref_         = `SAL-${requestId.slice(0, 8).toUpperCase()}`;

  return (
    <Document title={`Attestation de salaire — ${employeeName}`}>
      <Page size="A4" style={s.page}>
        <Header cabinet={cabinet} docType="attestation_salaire" ref_={ref_} issueDate={issueDate} />

        <Text style={s.sectionLabel}>Informations sur l'employé</Text>
        <View style={s.infoRow}><Text style={s.infoLabel}>Nom et prénom</Text><Text style={s.infoValue}>{employeeName}</Text></View>
        {employee.position && <View style={s.infoRow}><Text style={s.infoLabel}>Poste / Fonction</Text><Text style={s.infoValue}>{employee.position}</Text></View>}
        {employee.onBoarding && <View style={s.infoRow}><Text style={s.infoLabel}>Date d'entrée</Text><Text style={s.infoValue}>{fmtDate(employee.onBoarding)}</Text></View>}
        {employee.taxid && <View style={s.infoRow}><Text style={s.infoLabel}>N° identification</Text><Text style={s.infoValue}>{employee.taxid}</Text></View>}

        <View style={s.divider} />

        <Text style={s.body}>
          {`Je soussigné(e), représentant légal de la société `}
          <Text style={s.bold}>{companyName}</Text>
          {`, atteste par la présente que `}
          <Text style={s.bold}>{employeeName}</Text>
          {employee.position ? `, occupant le poste de ` : ''}
          {employee.position ? <Text style={s.bold}>{employee.position}</Text> : ''}
          {`, perçoit une rémunération mensuelle nette de :`}
        </Text>

        <View style={s.highlight}>
          <Text style={s.highlightText}>{fmt(employee.salary)} FCFA / mois</Text>
          <Text style={{ fontSize: 8, color: GRAY_TEXT, marginTop: 4 }}>Salaire net mensuel</Text>
        </View>

        <Text style={[s.body, { marginTop: 0 }]}>
          {`Cette attestation est délivrée à l'intéressé(e) sur sa demande, notamment pour la constitution d'un dossier bancaire ou administratif.\n\nElle ne saurait être considérée comme une garantie de l'employeur.`}
        </Text>

        <View style={s.signRow}>
          <View style={s.signBox}>
            <Text style={s.signLabel}>Fait à {city}, le {issueDate}</Text>
            <Text style={[s.signLabel, { marginTop: 40 }]}>Signature et cachet de l'employeur</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>{companyName}</Text>
          <Text style={s.footerText}>Attestation de salaire — {ref_}</Text>
          <Text style={s.footerText}>Document confidentiel</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Certificat de travail ────────────────────────────────────────────────────
function CertificatTravail({ employee, cabinet, issueDate, requestId }: Omit<Props, 'documentType'>) {
  const companyName  = cabinet?.company_name ?? 'l\'entreprise';
  const city         = cabinet?.city ?? 'Lomé';
  const employeeName = `${employee.firstName} ${employee.lastName}`;
  const ref_         = `CERT-${requestId.slice(0, 8).toUpperCase()}`;

  return (
    <Document title={`Certificat de travail — ${employeeName}`}>
      <Page size="A4" style={s.page}>
        <Header cabinet={cabinet} docType="certificat_travail" ref_={ref_} issueDate={issueDate} />

        <Text style={s.sectionLabel}>Informations sur l'employé</Text>
        <View style={s.infoRow}><Text style={s.infoLabel}>Nom et prénom</Text><Text style={s.infoValue}>{employeeName}</Text></View>
        {employee.position && <View style={s.infoRow}><Text style={s.infoLabel}>Poste / Fonction</Text><Text style={s.infoValue}>{employee.position}</Text></View>}
        {employee.onBoarding && <View style={s.infoRow}><Text style={s.infoLabel}>Date d'entrée</Text><Text style={s.infoValue}>{fmtDate(employee.onBoarding)}</Text></View>}
        <View style={s.infoRow}><Text style={s.infoLabel}>Date de sortie</Text><Text style={s.infoValue}>{issueDate}</Text></View>

        <View style={s.divider} />

        <Text style={s.body}>
          {`Je soussigné(e), représentant légal de la société `}
          <Text style={s.bold}>{companyName}</Text>
          {`, certifie que `}
          <Text style={s.bold}>{employeeName}</Text>
          {employee.position ? `, qui a occupé le poste de ` : ''}
          {employee.position ? <Text style={s.bold}>{employee.position}</Text> : ''}
          {employee.onBoarding ? `, a été employé(e) dans notre société du ` : ' a été employé(e) dans notre société'}
          {employee.onBoarding ? <Text style={s.bold}>{fmtDate(employee.onBoarding)}</Text> : ''}
          {employee.onBoarding ? ` au ` : ''}
          {employee.onBoarding ? <Text style={s.bold}>{issueDate}</Text> : ''}
          {`.`}
          {`\n\nAu terme de cette période, l'intéressé(e) quitte notre entreprise à la date mentionnée ci-dessus. Ce certificat de travail lui est remis conformément aux dispositions légales en vigueur.`}
        </Text>

        <View style={[s.stamp, { alignSelf: 'center', marginTop: 30 }]}>
          <Text style={s.stampText}>Cachet et signature de l'employeur</Text>
          <View style={{ height: 60 }} />
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>{companyName}</Text>
          <Text style={s.footerText}>Certificat de travail — {ref_}</Text>
          <Text style={s.footerText}>Document officiel</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Export principal ─────────────────────────────────────────────────────────
export function HRDocumentPDF({ documentType, employee, cabinet, issueDate, requestId }: Props) {
  if (documentType === 'attestation_salaire') {
    return <AttestationSalaire employee={employee} cabinet={cabinet} issueDate={issueDate} requestId={requestId} />;
  }
  if (documentType === 'certificat_travail') {
    return <CertificatTravail employee={employee} cabinet={cabinet} issueDate={issueDate} requestId={requestId} />;
  }
  return <AttestationTravail employee={employee} cabinet={cabinet} issueDate={issueDate} requestId={requestId} />;
}
