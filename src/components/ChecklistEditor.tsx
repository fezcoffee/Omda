"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ChecklistItem {
  id: string;
  text: string;
  quantity: string | null;
  checked: boolean;
  sortOrder: number;
}

interface Checklist {
  id: string;
  type: string;
  sentAt: string | null;
  sentTo: string | null;
  sentVia: string | null;
  items: ChecklistItem[];
}

interface ChecklistEditorProps {
  checklist: Checklist | null;
  eventId: string;
  type: "WAREHOUSE" | "DRIVER";
  eventDetails: { venue?: string | null; date?: string | null; clientName: string };
  onUpdate: () => void;
}

export default function ChecklistEditor({
  checklist,
  eventId,
  type,
  eventDetails,
  onUpdate,
}: ChecklistEditorProps) {
  const [items, setItems] = useState<ChecklistItem[]>(checklist?.items ?? []);
  const [newText, setNewText] = useState("");
  const [newQty, setNewQty] = useState("");
  const [recipient, setRecipient] = useState(checklist?.sentTo ?? "");
  const [via, setVia] = useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const label = type === "WAREHOUSE" ? "Warehouse Pack List" : "Driver Checklist";

  async function saveItems(updated: ChecklistItem[]) {
    setSaving(true);
    try {
      const res = await fetch(`/api/checklists/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, items: updated }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setItems(data.items);
      onUpdate();
    } catch {
      toast.error("Could not save checklist");
    } finally {
      setSaving(false);
    }
  }

  function addItem() {
    if (!newText.trim()) return;
    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      quantity: newQty.trim() || null,
      checked: false,
      sortOrder: items.length,
    };
    const updated = [...items, item];
    setItems(updated);
    saveItems(updated);
    setNewText("");
    setNewQty("");
  }

  function removeItem(id: string) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveItems(updated);
  }

  function toggleItem(id: string) {
    const updated = items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
    setItems(updated);
    saveItems(updated);
  }

  async function sendChecklist() {
    if (!recipient.trim()) {
      toast.error("Please enter a recipient phone number");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one item before sending");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          checklistId: checklist?.id,
          type: via,
          recipient,
          checklistType: type,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to send");
      }
      toast.success(`${label} sent via ${via === "WHATSAPP" ? "WhatsApp" : "SMS"}!`);
      onUpdate();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  const sent = !!checklist?.sentAt;

  return (
    <div className="space-y-6">
      {/* Items */}
      <div>
        <h3 className="text-sm font-semibold text-espresso-800 mb-3">
          {label} Items
        </h3>

        <div className="space-y-2 mb-4">
          {items.length === 0 && (
            <p className="text-sm text-espresso-400 italic py-4 text-center border border-dashed border-espresso-200 rounded-lg">
              No items yet — add one below
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-espresso-50 rounded-lg group"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
                className="w-4 h-4 accent-espresso-700 cursor-pointer"
              />
              <span className={cn("flex-1 text-sm", item.checked && "line-through text-espresso-400")}>
                {item.text}
              </span>
              {item.quantity && (
                <span className="text-xs bg-white border border-espresso-200 text-espresso-600 px-2 py-0.5 rounded-full">
                  {item.quantity}
                </span>
              )}
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add item form */}
        <div className="flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add item (e.g. Espresso machine)"
            className="input flex-1"
          />
          <input
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Qty"
            className="input w-20"
          />
          <button onClick={addItem} disabled={saving} className="btn-secondary whitespace-nowrap">
            {saving ? "Saving…" : "+ Add"}
          </button>
        </div>
      </div>

      {/* Send section */}
      <div className="border-t border-espresso-100 pt-5">
        <h3 className="text-sm font-semibold text-espresso-800 mb-3">
          {sent ? "Resend Checklist" : "Send Checklist"}
        </h3>
        {sent && (
          <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            ✓ Previously sent to {checklist?.sentTo} via {checklist?.sentVia}
          </div>
        )}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Phone / WhatsApp number</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="+447700900000"
              className="input"
            />
          </div>
          <div>
            <label className="label">Send via</label>
            <select
              value={via}
              onChange={(e) => setVia(e.target.value as "WHATSAPP" | "SMS")}
              className="input"
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>
        </div>
        <button
          onClick={sendChecklist}
          disabled={sending || items.length === 0}
          className="btn-primary mt-3"
        >
          {sending ? "Sending…" : `Send via ${via === "WHATSAPP" ? "WhatsApp" : "SMS"}`}
        </button>
      </div>
    </div>
  );
}
