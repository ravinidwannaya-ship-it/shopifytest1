/**
 * EmailJS settings — environment driven.
 *
 * Everything here is publishable (EmailJS keys are browser-side by design),
 * so values can live in `.env` as `VITE_*` variables and be changed without
 * touching any component code.
 *
 * Supported environment variables
 * -------------------------------
 * VITE_EMAILJS_SERVICE_ID      e.g. service_o0kcmbr
 * VITE_EMAILJS_TEMPLATE_ID     e.g. template_dypxc8l
 * VITE_EMAILJS_PUBLIC_KEY      Account → General → Public Key
 * VITE_STUDIO_EMAIL            inbox that receives studio copies
 * VITE_EMAILJS_FROM_NAME       "from name" shown in the template
 *
 * Template variable names — rename these to match whatever your EmailJS
 * template actually uses (e.g. set VITE_EMAILJS_VAR_TO_EMAIL=email if your
 * template's "To email" field is {{email}}):
 * VITE_EMAILJS_VAR_TO_EMAIL    (default: to_email)
 * VITE_EMAILJS_VAR_TO_NAME     (default: to_name)
 * VITE_EMAILJS_VAR_SUBJECT     (default: subject)
 * VITE_EMAILJS_VAR_MESSAGE     (default: message)
 * VITE_EMAILJS_VAR_REPLY_TO    (default: reply_to)
 * VITE_EMAILJS_VAR_FROM_NAME   (default: from_name)
 */

const env = import.meta.env as Record<string, string | undefined>;

const read = (key: string, fallback: string): string => {
  const value = env[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

/** Field names sent to EmailJS — must match the `{{placeholders}}` in your template. */
export interface EmailJsVariableMap {
  toEmail: string;
  toName: string;
  subject: string;
  message: string;
  replyTo: string;
  fromName: string;
}

export interface EmailJsSettings {
  serviceId: string;
  templateId: string;
  publicKey: string;
  studioEmail: string;
  fromName: string;
  variables: EmailJsVariableMap;
}

export const emailjsSettings: EmailJsSettings = {
  serviceId: read("VITE_EMAILJS_SERVICE_ID", "service_o0kcmbr"),
  templateId: read("VITE_EMAILJS_TEMPLATE_ID", "template_dypxc8l"),
  publicKey: read("VITE_EMAILJS_PUBLIC_KEY", "5fB6irNIKc806LulR"),
  studioEmail: read("VITE_STUDIO_EMAIL", "care@kyathi.in"),
  fromName: read("VITE_EMAILJS_FROM_NAME", "Kyathi Heritage"),
  variables: {
    toEmail: read("VITE_EMAILJS_VAR_TO_EMAIL", "to_email"),
    toName: read("VITE_EMAILJS_VAR_TO_NAME", "to_name"),
    subject: read("VITE_EMAILJS_VAR_SUBJECT", "subject"),
    message: read("VITE_EMAILJS_VAR_MESSAGE", "message"),
    replyTo: read("VITE_EMAILJS_VAR_REPLY_TO", "reply_to"),
    fromName: read("VITE_EMAILJS_VAR_FROM_NAME", "from_name"),
  },
};

/** True when the settings are complete enough to attempt a send. */
export const emailjsConfigured = (s: EmailJsSettings = emailjsSettings): boolean =>
  s.serviceId.length > 0 && s.templateId.length > 0 && s.publicKey.length > 0;

/** Builds the EmailJS template payload using the configured variable names. */
export function buildTemplateParams(
  fields: {
    toEmail: string;
    toName: string;
    subject: string;
    message: string;
    replyTo: string;
  },
  s: EmailJsSettings = emailjsSettings,
): Record<string, string> {
  const v = s.variables;
  return {
    [v.toEmail]: fields.toEmail,
    [v.toName]: fields.toName,
    [v.subject]: fields.subject,
    [v.message]: fields.message,
    [v.replyTo]: fields.replyTo,
    [v.fromName]: s.fromName,
  };
}
