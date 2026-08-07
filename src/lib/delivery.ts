/**
 * Pincode serviceability and delivery estimates.
 *
 * Mock logic today — swap the body of `checkPincode` for an API call to your
 * courier aggregator later; the returned shape is what the UI renders.
 */
export interface DeliveryEstimate {
  pincode: string;
  serviceable: boolean;
  zone: string;
  city: string;
  minDays: number;
  maxDays: number;
  etaLabel: string;
  codAvailable: boolean;
  expressAvailable: boolean;
  message: string;
}

interface Zone {
  name: string;
  city: string;
  prefixes: string[];
  minDays: number;
  cod: boolean;
  express: boolean;
}

const ZONES: Zone[] = [
  { name: "Metro South", city: "Chennai & Bengaluru belt", prefixes: ["60", "56", "64"], minDays: 2, cod: true, express: true },
  { name: "Metro West", city: "Mumbai & Pune belt", prefixes: ["40", "41"], minDays: 3, cod: true, express: true },
  { name: "Metro North", city: "Delhi NCR", prefixes: ["11", "12", "20"], minDays: 3, cod: true, express: true },
  { name: "Metro East", city: "Kolkata belt", prefixes: ["70", "71"], minDays: 4, cod: true, express: false },
  { name: "Telangana & AP", city: "Hyderabad, Vijayawada belt", prefixes: ["50", "51", "52"], minDays: 3, cod: true, express: true },
  { name: "Kerala", city: "Kochi, Trivandrum belt", prefixes: ["67", "68", "69"], minDays: 4, cod: true, express: false },
  { name: "West", city: "Gujarat & Rajasthan", prefixes: ["30", "31", "32", "36", "38", "39"], minDays: 4, cod: true, express: false },
  { name: "Central", city: "MP & Maharashtra interior", prefixes: ["42", "43", "44", "45", "46", "47", "48"], minDays: 5, cod: true, express: false },
];

/** Remote pincode ranges we can reach, but only by surface, and without COD. */
const REMOTE_PREFIXES = ["19", "18", "79", "78", "73", "74"];
/** Not on any insured lane today. */
const UNSERVICEABLE_PREFIXES = ["00", "99"];

export function isValidPincode(pincode: string): boolean {
  return /^[1-9]\d{5}$/.test(pincode);
}

export function checkPincode(rawPincode: string): DeliveryEstimate | null {
  const pincode = rawPincode.replace(/\D/g, "").slice(0, 6);
  if (!isValidPincode(pincode)) return null;

  const prefix = pincode.slice(0, 2);

  if (UNSERVICEABLE_PREFIXES.includes(prefix)) {
    return {
      pincode,
      serviceable: false,
      zone: "Unserviceable",
      city: "—",
      minDays: 0,
      maxDays: 0,
      etaLabel: "Not serviceable",
      codAvailable: false,
      expressAvailable: false,
      message:
        "We can't ship an insured, crated parcel to this pincode yet. Write to care@kyathi.in and we'll arrange a special dispatch.",
    };
  }

  const remote = REMOTE_PREFIXES.includes(prefix);
  const zone = ZONES.find((z) => z.prefixes.includes(prefix));

  const minDays = remote ? 7 : (zone?.minDays ?? 5);
  const maxDays = minDays + (remote ? 4 : 2);
  const etaLabel = formatEta(maxDays);

  return {
    pincode,
    serviceable: true,
    zone: remote ? "Remote lane" : (zone?.name ?? "Rest of India"),
    city: remote ? "Extended delivery area" : (zone?.city ?? "Standard network"),
    minDays,
    maxDays,
    etaLabel,
    codAvailable: !remote && (zone?.cod ?? true),
    expressAvailable: !remote && (zone?.express ?? false),
    message: remote
      ? `Delivers in ${minDays}–${maxDays} working days by surface. Prepaid orders only on this lane.`
      : `Delivers in ${minDays}–${maxDays} working days. Free insured shipping on orders above ₹999.`,
  };
}

function formatEta(maxDays: number): string {
  const date = new Date();
  let added = 0;
  while (added < maxDays) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) added += 1; // skip Sundays
  }
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
