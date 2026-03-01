/**
 * DOCX template rendering using docxtemplater + pizzip.
 * Upload a .docx file with {{placeholders}} and this module fills them in.
 */

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";

export interface TemplateData {
  client_name?: string;
  client_company?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  event_title?: string;
  event_date?: string;
  event_venue?: string;
  guest_count?: string;
  service_type?: string;
  package_info?: string;
  notes?: string;
  today_date?: string;
  [key: string]: string | undefined;
}

export function renderDocxTemplate(templatePath: string, data: TemplateData): Buffer {
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buf;
}

export function getUploadDir(): string {
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getTemplateDir(): string {
  const dir = path.join(process.cwd(), "public", "templates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function buildTemplateData(event: {
  title: string;
  eventDate?: Date | null;
  venue?: string | null;
  guestCount?: number | null;
  serviceType?: string | null;
  packageInfo?: string | null;
  notes?: string | null;
  client: {
    name: string;
    company?: string | null;
    email: string;
    phone?: string | null;
    address?: string | null;
  };
}): TemplateData {
  return {
    client_name: event.client.name,
    client_company: event.client.company ?? "",
    client_email: event.client.email,
    client_phone: event.client.phone ?? "",
    client_address: event.client.address ?? "",
    event_title: event.title,
    event_date: event.eventDate?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) ?? "TBC",
    event_venue: event.venue ?? "TBC",
    guest_count: event.guestCount?.toString() ?? "TBC",
    service_type: event.serviceType ?? "",
    package_info: event.packageInfo ?? "",
    notes: event.notes ?? "",
    today_date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  };
}
