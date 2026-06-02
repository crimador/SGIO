import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { readFile } from "fs/promises";
import path from "path";
import BadgePDF from "@/app/[locale]/(routes)/hr/components/BadgePDF";

export const dynamic = 'force-dynamic';

async function photoToDataUrl(photoPath: string | null): Promise<string | null> {
  if (!photoPath) return null;
  try {
    // photoPath = "/uploads/employees/xxx.jpg" — on lit depuis public/
    const filePath = path.join(process.cwd(), "public", photoPath);
    const buffer = await readFile(filePath);
    const ext = photoPath.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
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