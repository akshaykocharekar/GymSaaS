import { useEffect, useMemo, useState } from "react";
import Sheet from "./ui/Sheet.js";
import Button from "./ui/Button.js";
import {
  WHATSAPP_TEMPLATES,
  renderTemplate,
  buildWhatsAppLink,
  formatDateIndian,
  type WhatsAppTemplateKind,
  type TemplateContext,
} from "@gymora/shared";

interface Props {
  open: boolean;
  onClose: () => void;
  member: {
    fullName: string;
    phone: string;
    expiryDate: string;
  };
  gymName: string;
  /** Optional override defaults: pick a template based on context */
  defaultKind?: WhatsAppTemplateKind;
  /** Optional amount (for payment reminder / confirmation) */
  amount?: number;
}

export default function WhatsAppSheet({
  open,
  onClose,
  member,
  gymName,
  defaultKind = "WELCOME",
  amount,
}: Props) {
  const [kind, setKind] = useState<WhatsAppTemplateKind>(defaultKind);
  const [body, setBody] = useState("");

  const template = useMemo(
    () => WHATSAPP_TEMPLATES.find((t) => t.kind === kind)!,
    [kind]
  );

  const context: TemplateContext = useMemo(
    () => ({
      member_name: member.fullName.split(" ")[0],
      gym_name: gymName,
      amount: amount !== undefined ? amount : "",
      due_date: formatDateIndian(member.expiryDate),
      expiry_date: formatDateIndian(member.expiryDate),
    }),
    [member, gymName, amount]
  );

  useEffect(() => {
    if (!open) return;
    setKind(defaultKind);
  }, [open, defaultKind]);

  useEffect(() => {
    setBody(renderTemplate(template.body, context));
  }, [template, context]);

  function send() {
    const link = buildWhatsAppLink(member.phone, body);
    window.open(link, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Send WhatsApp message">
      <div className="space-y-4 pb-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Template
          </label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as WhatsAppTemplateKind)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
          >
            {WHATSAPP_TEMPLATES.map((t) => (
              <option key={t.kind} value={t.kind}>
                {t.label} — {t.description}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Message (edit freely)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans"
          />
          <p className="text-[11px] text-slate-500">
            To {member.fullName} · {member.phone}
          </p>
        </div>

        <Button onClick={send} fullWidth size="lg">
          Open in WhatsApp
        </Button>
        <p className="text-[11px] text-slate-500 text-center">
          Opens WhatsApp with the message pre-filled. You can review before
          sending.
        </p>
      </div>
    </Sheet>
  );
}