import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc || !doc.filePath) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), "public", doc.filePath);
  if (!fs.existsSync(absolutePath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  const buffer = await readFile(absolutePath);
  const ext = path.extname(doc.fileName).toLowerCase();
  const contentType = ext === ".pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${doc.fileName}"`,
    },
  });
}
