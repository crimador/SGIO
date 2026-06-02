import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { HRDocumentPDF } from '@/app/[locale]/(routes)/hr/components/HRDocumentPDF';
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

const DOC_LABELS: Record<string, string> = {
  attestation_travail: 'Attestation_Travail',
  attestation_salaire: 'Attestation_Salaire',
  certificat_travail:  'Certificat_Travail',
};

export async function GET(
  _req: Request,
  { params }: { params: { requestId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const [request, cabinet] = await Promise.all([
    (prismadb as any).request.findUnique({
      where: { id: params.requestId },
      include: {
        employee: {
          select: {
            firstName:  true,
            lastName:   true,
            position:   true,
            salary:     true,
            onBoarding: true,
            address:    true,
            taxid:      true,
          },
        },
      },
    }),
    prismadb.myAccount.findFirst(),
  ]);

  if (!request) return new NextResponse('Not found', { status: 404 });
  if (request.status !== 'APPROUVE') return new NextResponse('Document not approved', { status: 403 });

  const docType      = request.documentType ?? 'attestation_travail';
  const issueDate    = format(new Date(), 'dd MMMM yyyy', { locale: fr });
  const employeeName = `${request.employee.firstName}_${request.employee.lastName}`;
  const docLabel     = DOC_LABELS[docType] ?? docType;
  const filename     = `${docLabel}_${employeeName}.pdf`;

  const buffer = await renderToBuffer(
    React.createElement(HRDocumentPDF, {
      documentType: docType,
      employee: {
        firstName:  request.employee.firstName,
        lastName:   request.employee.lastName,
        position:   request.employee.position,
        salary:     request.employee.salary,
        onBoarding: request.employee.onBoarding,
        address:    request.employee.address,
        taxid:      request.employee.taxid,
      },
      cabinet: cabinet ? {
        company_name: cabinet.company_name,
        VAT_number:   cabinet.VAT_number,
        TAX_number:   cabinet.TAX_number,
        street:       cabinet.street,
        city:         cabinet.city,
        phone:        cabinet.phone,
        email:        cabinet.email,
        logoUrl:      cabinet.logoUrl,
      } : null,
      issueDate,
      requestId: params.requestId,
    })
  );

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
