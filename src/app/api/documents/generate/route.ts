import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderDocxTemplate, buildTemplateData, getTemplateDir } from "@/lib/docx";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

// POST /api/documents/generate — generate a document from template
export async function POST(req: NextRequest) {
  const { eventId, type } = await req.json();

  if (!eventId || !type) {
    return NextResponse.json({ error: "Missing eventId or type" }, { status: 400 });
  }

  // Load event with client
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { client: true },
  });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Find template file
  const templateDir = getTemplateDir();
  const templateFileName = `template_${type.toLowerCase()}.docx`;
  const templatePath = path.join(templateDir, templateFileName);

  if (!fs.existsSync(templatePath)) {
    return NextResponse.json(
      { error: `No template found for ${type}. Upload a .docx template first.` },
      { status: 404 }
    );
  }

  // Build template data
  const data = buildTemplateData({
    title: event.title,
    eventDate: event.eventDate,
    venue: event.venue,
    guestCount: event.guestCount,
    serviceType: event.serviceType,
    packageInfo: event.packageInfo,
    notes: event.notes,
    client: {
      name: event.client.name,
      company: event.client.company,
      email: event.client.email,
      phone: event.client.phone,
      address: event.client.address,
    },
  });

  // Render template
  const buffer = renderDocxTemplate(templatePath, data);

  // Save the generated file
  const uploadDir = path.join(process.cwd(), "public", "uploads", eventId);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${type.toLowerCase()}_${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const publicPath = `/uploads/${eventId}/${fileName}`;

  // Upsert document record (replace existing generated doc of this type)
  const existing = await prisma.document.findFirst({ where: { eventId, type } });
  let doc;
  if (existing) {
    doc = await prisma.document.update({
      where: { id: existing.id },
      data: { fileName, filePath: publicPath },
    });
  } else {
    doc = await prisma.document.create({
      data: { eventId, type, fileName, filePath: publicPath },
    });
  }

  return NextResponse.json(doc);
}
