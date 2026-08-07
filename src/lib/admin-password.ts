/**
 * Shared store password for the admin panel.
 *
 * The server function prefers the ADMIN_PANEL_PASSWORD environment secret and
 * only uses this value when that secret is missing — which is the case on
 * self-hosted deployments such as Cloudflare Workers.
 */
export const DEFAULT_ADMIN_PASSWORD = "kyathi@999";
