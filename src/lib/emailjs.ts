import emailjs from "@emailjs/browser";
import {
  buildTemplateParams,
  emailjsConfigured,
  emailjsSettings,
} from "@/lib/emailjs-config";

/**
 * EmailJS delivery layer.
 * All configuration (IDs, keys, template variable names) lives in
 * `src/lib/emailjs-config.ts` and is driven by `VITE_*` environment variables.
 */
export const EMAILJS_SERVICE_ID = emailjsSettings.serviceId;
export const EMAILJS_TEMPLATE_ID = emailjsSettings.templateId;
export const EMAILJS_PUBLIC_KEY = emailjsSettings.publicKey;

/** Studio inbox that receives enquiry / order copies. */
export const STUDIO_EMAIL = emailjsSettings.studioEmail;

export const emailReady = () => emailjsConfigured();

export interface MailPayload {
  /** Recipient address. */
  to: string;
  /** Recipient display name. */
  toName?: string | undefined;
  subject: string;
  /** Plain-text body (newlines preserved). */
  message: string;
  replyTo?: string | undefined;
}

/**
 * Sends one email through EmailJS. Never throws — email is always best-effort
 * so it can't block an order or an enquiry from completing.
 */
export async function sendEmail(payload: MailPayload): Promise<boolean> {
  if (!emailReady()) {
    console.warn("[emailjs] not configured — skipped:", payload.subject);
    return false;
  }
  try {
    await emailjs.send(
      emailjsSettings.serviceId,
      emailjsSettings.templateId,
      buildTemplateParams({
        toEmail: payload.to,
        toName: payload.toName ?? payload.to,
        subject: payload.subject,
        message: payload.message,
        replyTo: payload.replyTo ?? STUDIO_EMAIL,
      }),
      { publicKey: emailjsSettings.publicKey },
    );
    return true;
  } catch (err) {
    console.error("[emailjs] send failed", err);
    return false;
  }
}

/** Sends the same brief to the shopper and a copy to the studio. */
export async function sendWithStudioCopy(
  payload: MailPayload,
  studioSubject?: string,
): Promise<void> {
  await sendEmail(payload);
  if (payload.to.toLowerCase() !== STUDIO_EMAIL.toLowerCase()) {
    await sendEmail({
      to: STUDIO_EMAIL,
      toName: "Kyathi Studio",
      subject: studioSubject ?? `[Studio copy] ${payload.subject}`,
      message: payload.message,
      replyTo: payload.replyTo ?? payload.to,
    });
  }
}
