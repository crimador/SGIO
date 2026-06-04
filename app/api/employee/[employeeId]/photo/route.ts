import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { employeeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthenticated", { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return new NextResponse("Aucun fichier", { status: 400 });

    // Téléversement vers Vercel Blob (stockage cloud)
    const blob = await put(`employees/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN?.trim(),
    });

    await prismadb.employee.update({
      where: { id: params.employeeId },
      data: { photo: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const detail =
      error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
    console.log("[EMPLOYEE_PHOTO_POST]", detail);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}