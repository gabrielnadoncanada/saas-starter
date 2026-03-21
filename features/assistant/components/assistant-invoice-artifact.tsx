"use client";

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@/components/ai-elements/artifact";
import type { CreateInvoiceDraftToolResult } from "@/features/assistant/types";
import { CopyIcon, DownloadIcon, ReceiptTextIcon } from "lucide-react";

type InvoiceDraft = Extract<CreateInvoiceDraftToolResult, { success: true }>["result"];

type AssistantInvoiceArtifactProps = {
  invoice: InvoiceDraft;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
  }).format(amount);
}

export function AssistantInvoiceArtifact({
  invoice,
}: AssistantInvoiceArtifactProps) {
  const summary = [
    `Invoice ${invoice.invoiceNumber}`,
    `Client: ${invoice.clientName}`,
    `Due: ${invoice.dueDate}`,
    "",
    ...invoice.items.map(
      (item) =>
        `${item.description} — ${item.quantity} x ${formatMoney(item.unitPrice, invoice.currency)} = ${formatMoney(item.total, invoice.currency)}`
    ),
    "",
    `Total: ${formatMoney(invoice.subtotal, invoice.currency)}`,
    invoice.notes ? `Notes: ${invoice.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Artifact>
      <ArtifactHeader>
        <div className="min-w-0">
          <ArtifactTitle className="flex items-center gap-2">
            <ReceiptTextIcon className="size-4 text-orange-500" />
            {invoice.invoiceNumber}
          </ArtifactTitle>
          <ArtifactDescription>
            {invoice.clientName}
            {invoice.clientEmail ? ` • ${invoice.clientEmail}` : ""}
            {` • Due ${invoice.dueDate}`}
          </ArtifactDescription>
        </div>
        <ArtifactActions>
          <ArtifactAction
            icon={CopyIcon}
            label="Copy invoice summary"
            onClick={() => navigator.clipboard.writeText(summary)}
            tooltip="Copy invoice summary"
          />
          <ArtifactAction
            icon={DownloadIcon}
            label="Download invoice draft"
            onClick={() => {
              const blob = new Blob([summary], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = `${invoice.invoiceNumber}.txt`;
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }}
            tooltip="Download draft"
          />
        </ArtifactActions>
      </ArtifactHeader>
      <ArtifactContent className="space-y-4">
        <div className="grid gap-2 rounded-lg border bg-background p-3">
          {invoice.items.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_auto] gap-3 border-b pb-2 last:border-b-0 last:pb-0"
              key={`${item.description}-${index}`}
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatMoney(item.unitPrice, invoice.currency)}
                </p>
              </div>
              <p className="text-right font-medium text-sm">
                {formatMoney(item.total, invoice.currency)}
              </p>
            </div>
          ))}
        </div>
        {invoice.notes ? (
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            {invoice.notes}
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-semibold text-base">
            {formatMoney(invoice.subtotal, invoice.currency)}
          </span>
        </div>
      </ArtifactContent>
    </Artifact>
  );
}
