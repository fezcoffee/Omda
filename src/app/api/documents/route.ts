import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST /api/documents — upload a document or template
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId") as string;
    const type = formData.get("type") as string;
    const isTemplate = formData.get("isTemplate") === "true";

    if (!file || !eventId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dir = isTemplate
      ? path.join(process.cwd(), "public", "templates")
      : path.join(process.cwd(), "public", "uploads", eventId);

    await mkdir(dir, { recursive: true });

    const fileName = isTemplate
      ? `template_${type.toLowerCase()}.docx`
      : `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const filePath = path.join(dir, fileName);
    await writeFile(filePath, buffer);

    const publicPath = isTemplate
      ? `/templates/${fileName}`
      : `/uploads/${eventId}/${fileName}`;

    if (!isTemplate) {
      // Save document record
      const doc = await prisma.document.create({
        data: {
          eventId,
          type,
          fileName: file.name,
          filePath: publicPath,
        },
      });
      return NextResponse.json(doc, { status: 201 });
    }

    return NextResponse.json({ ok: true, path: publicPath });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
