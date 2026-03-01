/**
 * Xero integration for invoice generation.
 * Uses xero-node SDK with OAuth2.
 */

import { XeroClient, Invoice } from "xero-node";

let xeroClient: XeroClient | null = null;

export function getXeroClient(): XeroClient {
  if (!process.env.XERO_CLIENT_ID || !process.env.XERO_CLIENT_SECRET) {
    throw new Error("Xero credentials not configured. Add XERO_CLIENT_ID and XERO_CLIENT_SECRET to .env");
  }
  if (!xeroClient) {
    xeroClient = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID,
      clientSecret: process.env.XERO_CLIENT_SECRET,
      redirectUris: [process.env.XERO_REDIRECT_URI ?? "http://localhost:3000/api/xero/callback"],
      scopes: ["openid", "profile", "email", "accounting.transactions", "accounting.contacts", "offline_access"],
    });
  }
  return xeroClient;
}

export async function getAuthorizationUrl(): Promise<string> {
  const client = getXeroClient();
  const url = await client.buildConsentUrl();
  return url;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitAmount: number;
  accountCode?: string;
}

export interface CreateInvoiceParams {
  contactName: string;
  contactEmail: string;
  lineItems: InvoiceLineItem[];
  dueDate?: Date;
  reference?: string;
  currencyCode?: string;
}

export async function createXeroInvoice(
  params: CreateInvoiceParams,
  accessToken: string,
  tenantId: string
): Promise<{ invoiceId: string; invoiceNumber: string; url: string }> {
  const client = getXeroClient();

  await client.setTokenSet({ access_token: accessToken });

  const invoice: Invoice = {
    type: Invoice.TypeEnum.ACCREC,
    contact: {
      name: params.contactName,
      emailAddress: params.contactEmail,
    },
    lineItems: params.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      accountCode: item.accountCode ?? "200",
    })),
    dueDate: params.dueDate?.toISOString().split("T")[0],
    reference: params.reference,
    currencyCode: (params.currencyCode ?? "GBP") as unknown as Invoice["currencyCode"],
    status: Invoice.StatusEnum.AUTHORISED,
  };

  const response = await client.accountingApi.createInvoices(tenantId, {
    invoices: [invoice],
  });

  const created = response.body.invoices?.[0];
  if (!created?.invoiceID) throw new Error("Failed to create Xero invoice");

  return {
    invoiceId: created.invoiceID,
    invoiceNumber: created.invoiceNumber ?? "",
    url: `https://go.xero.com/AccountsReceivable/Edit.aspx?InvoiceID=${created.invoiceID}`,
  };
}
