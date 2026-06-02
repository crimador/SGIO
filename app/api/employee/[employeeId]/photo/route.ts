import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${params.employeeId}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "employees");
    await writeFile(path.join(uploadDir, filename), buffer);

    const photoUrl = `/uploads/employees/${filename}`;
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