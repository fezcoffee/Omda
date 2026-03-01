import { NextRequest, NextResponse } from "next/server";
import { getXeroClient } from "@/lib/xero";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const client = getXeroClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenSet = await (client as any).apiCallback(req.url);

    // Store tokens in DB settings
    await prisma.setting.upsert({
      where: { key: "xero_token" },
      update: { value: JSON.stringify(tokenSet) },
      create: { key: "xero_token", value: JSON.stringify(tokenSet) },
    });

    // Get tenant ID
    const tenants = await client.updateTenants();
    if (tenants.length > 0) {
      await prisma.setting.upsert({
        where: { key: "xero_tenant_id" },
        update: { value: tenants[0].tenantId },
        create: { key: "xero_tenant_id", value: tenants[0].tenantId },
      });
    }

    return NextResponse.redirect(new URL("/settings?xero=connected", req.url));
  } catch (err: unknown) {
    console.error("Xero callback error:", err);
    return NextResponse.redirect(new URL("/settings?xero=error", req.url));
  }
}
