import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

type BadgeData = {
  id:        string;
  firstName: string;
  lastName:  string;
  position?: string | null;
  photo?:    string | null;
  onBoarding?: string | null;
  companyName: string;
  companyLogo?: string | null;
  companyCity?: string | null;
};

// Badge format carte d'identité standard : 85.6mm × 54mm
// En points PDF : ~242 × 153
const W = 242;
const H = 153;

const NAVY  = '#1e3a5f';
const WHITE = '#ffffff';
const GRAY  = '#6b7280';
const LIGHT = '#f1f5f9';

const s = StyleSheet.create({
  page: {
    width: W,
    height: H,
    backgroundColor: WHITE,
    fontFamily: 'Helvetica',
  },

  // Bande supérieure
  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logo: { width: 20, height: 20, objectFit: 'contain' },
  companyName: {
    color: WHITE,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  badgeLabel: {
    color: WHITE,
    fontSize: 6,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Corps
  body: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },

  // Photo
  photoBox: {
    width: 60,
    height: 75,
    backgroundColor: LIGHT,
    borderRadius: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1pt solid #e2e8f0',
  },
  photo: { width: 60, height: 75, objectFit: 'cover' },
  photoPlaceholder: {
    fontSize: 24,
    color: '#cbd5e1',
  },

  // Infos
  infoBlock: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    lineHeight: 1.2,
  },
  position: {
    fontSize: 8,
    color: GRAY,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 6,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    width: 32,
  },
  infoValue: {
    fontSize: 7,
    color: '#1e293b',
    flex: 1,
  },

  // Pied
  footer: {
    backgroundColor: LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1pt solid #e2e8f0',
  },
  footerText: { fontSize: 6, color: GRAY },
  footerAccent: { fontSize: 6, color: NAVY, fontFamily: 'Helvetica-Bold' },
});

function formatDate(d?: string | null) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return '—'; }
}

// Numéro d'employé lisible : EMP-XXXX (4 derniers caractères de l'ID)
function employeeNumber(id: string) {
  return `EMP-${id.slice(-6).toUpperCase()}`;
}

export default function BadgePDF({ employee }: { employee: BadgeData }) {
  return (
    <Document>
      <Page size={[W, H]} style={s.page}>

        {/* Header */}
        <View style={s.header}>
          {employee.companyLogo && (
            <Image src={employee.companyLogo} style={s.logo} />
          )}
          <Text style={s.companyName}>{employee.companyName}</Text>
          <Text style={s.badgeLabel}>Badge</Text>
        </View>

        {/* Corps */}
        <View style={s.body}>

          {/* Photo */}
          <View style={s.photoBox}>
            {employee.photo ? (
              <Image src={employee.photo} style={s.photo} />
            ) : (
              <Text style={s.photoPlaceholder}>
                {employee.firstName[0]}{employee.lastName[0]}
              </Text>
            )}
          </View>

          {/* Infos */}
          <View style={s.infoBlock}>
            <Text style={s.name}>{employee.firstName}{'\n'}{employee.lastName.toUpperCase()}</Text>
            {employee.position && (
              <Text style={s.position}>{employee.position}</Text>
            )}
            <View style={s.divider} />
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>N° Emp.</Text>
              <Text style={s.infoValue}>{employeeNumber(employee.id)}</Text>
            </View>
            {employee.onBoarding && (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Entrée</Text>
                <Text style={s.infoValue}>{formatDate(employee.onBoarding)}</Text>
              </View>
            )}
            {employee.companyCity && (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Lieu</Text>
                <Text style={s.infoValue}>{employee.companyCity}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Ce badge est la propriété de l'entreprise</Text>
          <Text style={s.footerAccent}>{employee.companyName}</Text>
        </View>

      </Page>
    </Document>
  );
}
