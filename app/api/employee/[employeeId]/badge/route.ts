import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import BadgePDF from "@/app/[locale]/(routes)/hr/components/BadgePDF";

export const dynamic = 'force-dynamic';

async function photoToDataUrl(photoUrl: string | null): Promise<string | null> {
  if (!photoUrl) return null;
  try {
    // La photo est désormais une URL Vercel Blob (https://...) :
    // on la télécharge puis on la convertit en data URL pour le PDF.
    if (!photoUrl.startsWith("http")) return null;

    const res = await fetch(photoUrl);
    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "";
    const ext = photoUrl.split(".").pop()?.toLowerCase() ?? "";
    const mime =
      contentType.startsWith("image/")
        ? contentType
        : ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg";

    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    const [employee, account] = await Promise.all([
      prismadb.employee.findUnique({ where: { id: params.employeeId } }),
      prismadb.myAccount.findFirst(),
    ]);

    if (!employee) return new NextResponse("Employe introuvable", { status: 404 });

    const photoDataUrl = await photoToDataUrl(employee.photo);

    const badgeData = {
      id:          employee.id,
      firstName:   employee.firstName,
      lastName:    employee.lastName,
      position:    employee.position,
      photo:       photoDataUrl,
      onBoarding:  employee.onBoarding?.toISOString() ?? null,
      companyName: account?.company_name ?? "Entreprise",
      companyLogo: account?.logoUrl ?? null,
      companyCity: account?.city ?? null,
    };

    const buffer = await renderToBuffer(createElement(BadgePDF, { employee: badgeData }));

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="badge-${employee.firstName}-${employee.lastName}.pdf"`,
      },
    });
  } catch (error) {
    console.log("[BADGE_GET]", error);
    return new NextResponse("Erreur generation badge", { status: 500 });
  }
}