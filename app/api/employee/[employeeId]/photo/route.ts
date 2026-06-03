import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { utapi } from "@/lib/server/uploadthings";

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

    // Téléversement vers UploadThing (stockage cloud)
    const uploaded = await utapi.uploadFiles(file);

    if (uploaded.error || !uploaded.data) {
      console.log("[EMPLOYEE_PHOTO_POST] UploadThing error", uploaded.error);
      return new NextResponse("Erreur lors du téléversement", { status: 500 });
    }

    const photoUrl = uploaded.data.url;
    await prismadb.employee.update({
      where: { id: params.employeeId },
      data: { photo: photoUrl },
    });

    return NextResponse.json({ url: photoUrl });
  } catch (error) {
    console.log("[EMPLOYEE_PHOTO_POST]", error);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}