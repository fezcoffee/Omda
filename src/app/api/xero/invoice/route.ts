import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getXeroClient, createXeroInvoice } from "@/lib/xero";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, contactName, contactEmail, lineItems, dueDate, reference } = body;

    // Load Xero tokens from DB
    const tokenSetting = await prisma.setting.findUnique({ where: { key: "xero_token" } });
    const tenantSetting = await prisma.setting.findUnique({ where: { key: "xero_tenant_id" } });

    if (!tokenSetting || !tenantSetting) {
      return NextResponse.json(
        { error: "Xero not connected. Go to Settings to connect your Xero account." },
        { status: 400 }
      );
    }

    const tokenSet = JSON.parse(tokenSetting.value);
    const tenantId = tenantSetting.value;

    // Refresh token if needed
    const client = getXeroClient();
    await client.setTokenSet(tokenSet);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refreshed = await (client as any).refreshWithRefreshToken();

    // Update stored token
    await prisma.setting.update({
      where: { key: "xero_token" },
      data: { value: JSON.stringify(refreshed) },
    });

    const result = await createXeroInvoice(
      {
        contactName,
        contactEmail,
        lineItems,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        reference,
      },
      refreshed.access_token as string,
      tenantId
    );

    // Record invoice document
    await prisma.document.create({
      data: {
        eventId,
        type: "INVOICE",
        fileName: `Invoice-${result.invoiceNumber}.xero`,
        filePath: result.url,
        sentAt: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Xero invoice error:", err);
    const message = err instanceof Error ? err.message : "Invoice creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
