import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Row, Column,
} from '@react-email/components';
import * as React from 'react';

interface InvoiceReminderProps {
  clientName:   string;
  invoiceNumber: string;
  invoiceDate:  string;
  dueDate:      string | null;
  amount:       string;
  daysOverdue:  number | null;
  cabinetName:  string;
  cabinetPhone: string | null;
  cabinetEmail: string | null;
  reminderCount: number; // 1 = première relance, 2 = deuxième, etc.
}

function fmt(n: number) {
  return Math.abs(n).toString();
}

export function InvoiceReminderEmail({
  clientName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  amount,
  daysOverdue,
  cabinetName,
  cabinetPhone,
  cabinetEmail,
  reminderCount,
}: InvoiceReminderProps) {
  const isOverdue = daysOverdue !== null && daysOverdue > 0;
  const subject   = reminderCount === 1
    ? `Rappel de paiement — Facture ${invoiceNumber}`
    : `${reminderCount}e rappel — Facture ${invoiceNumber} en attente de règlement`;

  const intro = reminderCount === 1
    ? `Sauf erreur de notre part, la facture mentionnée ci-dessous reste en attente de règlement.`
    : `Malgré nos précédents rappels, nous n'avons pas encore reçu le règlement de la facture ci-dessous.`;

  const urgency = isOverdue && daysOverdue! > 30
    ? `Cette facture accuse un retard de ${fmt(daysOverdue!)} jours. Nous vous prions de bien vouloir régulariser cette situation dans les plus brefs délais afin d'éviter tout contentieux.`
    : isOverdue
    ? `Cette facture est en retard de ${fmt(daysOverdue!)} jour${daysOverdue! > 1 ? 's' : ''}. Nous vous remercions de bien vouloir procéder au règlement rapidement.`
    : `Nous vous remercions de bien vouloir procéder au règlement à la date convenue.`;

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ margin: '40px auto', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

          {/* En-tête */}
          <Section style={{ backgroundColor: '#1e3a5f', padding: '24px 32px' }}>
            <Heading style={{ color: '#ffffff', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>
              {cabinetName}
            </Heading>
            <Text style={{ color: '#93c5fd', fontSize: '13px', margin: '4px 0 0 0' }}>
              Rappel de paiement
            </Text>
          </Section>

          {/* Corps */}
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '15px', color: '#1e293b', marginTop: 0 }}>
              Madame, Monsieur <strong>{clientName}</strong>,
            </Text>

            <Text style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              {intro}
            </Text>

            {/* Détails facture */}
            <Section style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '16px 20px', margin: '20px 0', border: '1px solid #e2e8f0' }}>
              <Row>
                <Column style={{ width: '50%' }}>
                  <Text style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>N° Facture</Text>
                  <Text style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{invoiceNumber}</Text>
                </Column>
                <Column style={{ width: '50%' }}>
                  <Text style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>Montant TTC</Text>
                  <Text style={{ fontSize: '15px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>{amount} FCFA</Text>
                </Column>
              </Row>
              <Hr style={{ borderColor: '#e2e8f0', margin: '12px 0' }} />
              <Row>
                <Column style={{ width: '50%' }}>
                  <Text style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>Date d'émission</Text>
                  <Text style={{ fontSize: '13px', color: '#475569', margin: 0 }}>{invoiceDate}</Text>
                </Column>
                {dueDate && (
                  <Column style={{ width: '50%' }}>
                    <Text style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>Date d'échéance</Text>
                    <Text style={{ fontSize: '13px', color: isOverdue ? '#dc2626' : '#475569', fontWeight: isOverdue ? 'bold' : 'normal', margin: 0 }}>
                      {dueDate}{isOverdue ? ` (${fmt(daysOverdue!)} j de retard)` : ''}
                    </Text>
                  </Column>
                )}
              </Row>
            </Section>

            <Text style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              {urgency}
            </Text>

            <Text style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Pour tout renseignement ou en cas d'erreur, n'hésitez pas à nous contacter.
            </Text>

            <Text style={{ fontSize: '14px', color: '#1e293b', marginTop: '24px' }}>
              Cordialement,
            </Text>
            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginTop: '4px' }}>
              {cabinetName}
            </Text>
            {cabinetPhone && (
              <Text style={{ fontSize: '13px', color: '#64748b', margin: '2px 0' }}>
                Tél : {cabinetPhone}
              </Text>
            )}
            {cabinetEmail && (
              <Text style={{ fontSize: '13px', color: '#64748b', margin: '2px 0' }}>
                {cabinetEmail}
              </Text>
            )}
          </Section>

          {/* Pied */}
          <Section style={{ backgroundColor: '#f1f5f9', padding: '16px 32px', borderTop: '1px solid #e2e8f0' }}>
            <Text style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Cet email est généré automatiquement par votre logiciel de facturation. Merci de ne pas y répondre directement.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

export default InvoiceReminderEmail;
