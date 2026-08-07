/**
 * Single source of truth for the Kyathi catalog.
 *
 * Kyathi sells exactly two things:
 *   1. Gold-coated silver idols (metal)
 *   2. Idols mounted in photo frames
 *
 * To ADD a product: append an object to `products`.
 * To EDIT a product: change its fields here.
 * To DELETE a product: remove the object.
 *
 * Nothing else in the app needs to change — every screen reads through
 * `src/lib/catalog.ts`, never from this file directly.
 */
import gcsGanesha from "@/assets/gcs-ganesha.jpg";
import gcsLakshmi from "@/assets/gcs-lakshmi.jpg";
import gcsBalaji from "@/assets/gcs-balaji.jpg";
import gcsKrishna from "@/assets/gcs-krishna.jpg";
import gcsDurga from "@/assets/gcs-durga.jpg";
import gcsSaraswati from "@/assets/gcs-saraswati.jpg";
import frameGanesha from "@/assets/frame-ganesha.jpg";
import frameLakshmiGanesha from "@/assets/frame-lakshmi-ganesha.jpg";
import frameBalaji from "@/assets/frame-balaji.jpg";
import frameSaiBaba from "@/assets/frame-sai-baba.jpg";
import heroIdols from "@/assets/hero-gcs.jpg";
import heroFrames from "@/assets/hero-frames.jpg";

export const IMAGES = {
  gcsGanesha,
  gcsLakshmi,
  gcsBalaji,
  gcsKrishna,
  gcsDurga,
  gcsSaraswati,
  frameGanesha,
  frameLakshmiGanesha,
  frameBalaji,
  frameSaiBaba,
  heroIdols,
  heroFrames,
};

/** Slugs are free-form so the admin panel can create new collections. */
export type CollectionSlug = string;

export type Material = string;
export type Finish = string;
export type ProductTag = "trending" | "most-gifted" | "new" | "best-seller";

export interface SizeVariant {
  /** e.g. `5"` */
  label: string;
  heightInches: number;
  /** added to the base price */
  priceDelta: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  figure: string;
  collection: CollectionSlug;
  material: Material;
  finishes: Finish[];
  sizes: SizeVariant[];
  /** base price in INR for the first size variant */
  price: number;
  compareAtPrice: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  tags: ProductTag[];
  shortDescription: string;
  description: string;
  specs: { label: string; value: string }[];
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export const collections: Collection[] = [
  {
    slug: "new-launches",
    name: "New Launches",
    tagline: "Fresh from the plating bath",
    description:
      "The newest gold-coated silver idols and framed deities from the Kyathi atelier — limited first runs.",
    image: heroIdols,
  },
  {
    slug: "gold-coated-silver",
    name: "Gold Coated Silver Idols",
    tagline: "999 silver, 24K gold coated",
    description:
      "Hand-finished metal idols cast in pure silver and coated in 24K gold — dual tone or full gold, hallmarked and certified.",
    image: gcsGanesha,
  },
  {
    slug: "photo-frames",
    name: "Idols with Photo Frames",
    tagline: "Deity reliefs, framed and ready",
    description:
      "Gold-coated silver deity reliefs set on velvet inside hand-finished wooden frames — for the pooja shelf, the wall, or gifting.",
    image: frameGanesha,
  },
];

const idolSpecs = (purity: string, weight: string) => [
  { label: "Metal", value: purity },
  { label: "Coating", value: "24K gold electroplating, anti-tarnish sealed" },
  { label: "Weight (approx.)", value: weight },
  { label: "Base", value: "Integrated, felt-lined" },
  { label: "Certification", value: "Purity certificate included" },
  { label: "Care", value: "Dry cloth only; never use metal polish or acid cleaners" },
  { label: "Made in", value: "Puttur, Karnataka, India" },
];

const frameSpecs = (frameMaterial: string, weight: string) => [
  { label: "Relief metal", value: "999 silver foil, 24K gold coated" },
  { label: "Frame", value: frameMaterial },
  { label: "Backing", value: "Maroon velvet mount, sealed acrylic front" },
  { label: "Weight (approx.)", value: weight },
  { label: "Mounting", value: "Table easel + wall hook, both included" },
  { label: "Care", value: "Wipe the acrylic with a dry microfibre cloth" },
  { label: "Made in", value: "Puttur, Karnataka, India" },
];

const sizeSet = (deltas: [string, number, number][]): SizeVariant[] =>
  deltas.map(([label, heightInches, priceDelta]) => ({
    label,
    heightInches,
    priceDelta,
  }));

export const products: Product[] = [
  {
    id: "p1",
    slug: "siddhi-ganesha-gold-coated-silver-idol",
    name: "Siddhi Ganesha Gold Coated Silver Idol",
    figure: "Ganesha",
    collection: "gold-coated-silver",
    material: "Gold Coated Silver",
    finishes: ["Dual Tone", "24K Gold Coated"],
    sizes: sizeSet([
      ['4"', 4, 0],
      ['6"', 6, 18000],
      ['9"', 9, 46000],
    ]),
    price: 32000,
    compareAtPrice: 38500,
    images: [gcsGanesha, gcsLakshmi],
    rating: 4.9,
    reviewCount: 148,
    stock: 6,
    tags: ["trending", "best-seller", "most-gifted"],
    shortDescription:
      "Seated Ganesha in 999 silver with 24K gold coating, dual-tone lotus base and hand-chased jewellery detail.",
    description:
      "Our most requested idol. The form is cast in 999 silver, then hand-chased before a 24K gold coating is laid over the crown, jewellery and dhoti — leaving the torso in bright silver for contrast. The lotus base is finished separately and set by hand. Each piece ships with a purity certificate and an anti-tarnish seal that keeps the silver bright for years.",
    specs: idolSpecs("999 fine silver", "480 g"),
  },
  {
    id: "p2",
    slug: "gajalakshmi-gold-coated-silver-idol",
    name: "Gajalakshmi Gold Coated Silver Idol",
    figure: "Lakshmi",
    collection: "gold-coated-silver",
    material: "Gold Coated Silver",
    finishes: ["Dual Tone", "24K Gold Coated"],
    sizes: sizeSet([
      ['5"', 5, 0],
      ['8"', 8, 24000],
      ['11"', 11, 58000],
    ]),
    price: 38500,
    compareAtPrice: 45000,
    images: [gcsLakshmi, gcsGanesha],
    rating: 4.9,
    reviewCount: 121,
    stock: 4,
    tags: ["trending", "best-seller"],
    shortDescription:
      "Standing Lakshmi on a gold-coated lotus, silver drape with gold-laid border and crown.",
    description:
      "Lakshmi stands on a fully gold-coated lotus, palms open in abhaya and varada mudra. The saree drape is left in mirror-polished silver so the gold-laid border, crown and jewellery read sharply against it. A Deepavali and Gruhapravesham favourite, and the piece most often bought as a wedding gift from our Puttur studio.",
    specs: idolSpecs("999 fine silver", "560 g"),
  },
  {
    id: "p3",
    slug: "tirupati-balaji-gold-coated-silver-idol",
    name: "Tirupati Balaji Gold Coated Silver Idol",
    figure: "Balaji",
    collection: "gold-coated-silver",
    material: "Gold Coated Silver",
    finishes: ["24K Gold Coated"],
    sizes: sizeSet([
      ['6"', 6, 0],
      ['9"', 9, 32000],
      ['12"', 12, 74000],
    ]),
    price: 44000,
    compareAtPrice: 52000,
    images: [gcsBalaji, gcsKrishna],
    rating: 4.8,
    reviewCount: 96,
    stock: 5,
    tags: ["best-seller", "most-gifted"],
    shortDescription:
      "Full 24K gold-coated Balaji with layered garland detail, on a stepped silver pedestal.",
    description:
      "A faithful rendering of the Venkateswara form — conch and chakra raised, garlands falling in five worked layers, namam picked out by hand. Coated fully in 24K gold over 999 silver, then sealed. The stepped pedestal is weighted so the idol stands secure on a shelf or in a mandir cabinet.",
    specs: idolSpecs("999 fine silver", "710 g"),
  },
  {
    id: "p4",
    slug: "venugopala-krishna-gold-coated-silver-idol",
    name: "Venugopala Krishna Gold Coated Silver Idol",
    figure: "Krishna",
    collection: "gold-coated-silver",
    material: "Gold Coated Silver",
    finishes: ["Dual Tone"],
    sizes: sizeSet([
      ['5"', 5, 0],
      ['8"', 8, 21000],
      ['10"', 10, 44000],
    ]),
    price: 35000,
    compareAtPrice: 41000,
    images: [gcsKrishna, gcsSaraswati],
    rating: 4.8,
    reviewCount: 87,
    stock: 7,
    tags: ["trending", "new"],
    shortDescription:
      "Krishna at the flute in dual-tone silver and gold, peacock feather crown finished by hand.",
    description:
      "The classic tribhanga stance, cast in 999 silver with the pitambara, garland and flute laid in 24K gold. The peacock feather is enamelled by hand after plating, which is why no two pieces carry exactly the same blue. Popular for Janmashtami and as a newborn blessing gift.",
    specs: idolSpecs("999 fine silver", "520 g"),
  },
  {
    id: "p5",
    slug: "mahishasuramardini-durga-gold-coated-silver-idol",
    name: "Mahishasuramardini Durga Gold Coated Silver Idol",
    figure: "Durga",
    collection: "gold-coated-silver",
    material: "Gold Coated Silver",
    finishes: ["Dual Tone", "Antique Silver"],
    sizes: sizeSet([
      ['7"', 7, 0],
      ['10"', 10, 38000],
    ]),
    price: 62000,
    compareAtPrice: 74000,
    images: [gcsDurga, gcsBalaji],
    rating: 5,
    reviewCount: 54,
    stock: 2,
    tags: ["new", "trending"],
    shortDescription:
      "Eight-armed Durga astride the lion, every weapon cast and set separately in gold-coated silver.",
    description:
      "Our most demanding casting. Each of the eight arms and its weapon is cast on its own and set into the torso by hand, then the lion's mane is chased strand by strand before plating. Silver body, 24K gold weapons and crown. Made in small batches of twelve.",
    specs: idolSpecs("999 fine silver", "1.2 kg"),
  },
  {
    id: "p6",
    slug: "veena-saraswati-gold-coated-silver-idol",
    name: "Veena Saraswati Gold Coated Silver Idol",
    figure: "Saraswati",
    collection: "gold-coated-silver",
    material: "925 Silver",
    finishes: ["Dual Tone", "Mirror Polish"],
    sizes: sizeSet([
      ['5"', 5, 0],
      ['8"', 8, 22000],
    ]),
    price: 33500,
    compareAtPrice: 39000,
    images: [gcsSaraswati, gcsLakshmi],
    rating: 4.7,
    reviewCount: 63,
    stock: 9,
    tags: ["most-gifted"],
    shortDescription:
      "Saraswati seated with the veena, fretwork and strings picked out in 24K gold.",
    description:
      "Cast in 925 sterling silver for a crisper edge on the veena's fretwork, then gold-coated on the instrument, crown and jewellery. The lotus seat is left in mirror polish. A standard gift for Vidyarambham, Saraswati Puja and academic milestones.",
    specs: idolSpecs("925 sterling silver", "490 g"),
  },
  {
    id: "p7",
    slug: "ganesha-gold-coated-silver-photo-frame",
    name: "Ganesha Gold Coated Silver Photo Frame",
    figure: "Ganesha",
    collection: "photo-frames",
    material: "Silver with Wood Frame",
    finishes: ["Dual Tone", "24K Gold Coated"],
    sizes: sizeSet([
      ['8" × 10"', 10, 0],
      ['11" × 14"', 14, 9500],
      ['16" × 20"', 20, 24000],
    ]),
    price: 14500,
    compareAtPrice: 18000,
    images: [frameGanesha, frameLakshmiGanesha],
    rating: 4.9,
    reviewCount: 132,
    stock: 12,
    tags: ["trending", "best-seller", "most-gifted"],
    shortDescription:
      "Dual-tone Ganesha relief on maroon velvet inside a carved teak frame, easel and wall hook included.",
    description:
      "A 999 silver foil relief, embossed by hand and selectively gold-coated, mounted on maroon velvet inside a carved teak frame with an acrylic front. It stands on the supplied easel or hangs on the wall — the fixings for both are in the box. The most common gift order we ship for housewarmings.",
    specs: frameSpecs("Carved teak, walnut finish", "1.1 kg"),
  },
  {
    id: "p8",
    slug: "lakshmi-ganesha-pair-photo-frame",
    name: "Lakshmi Ganesha Pair Photo Frame",
    figure: "Lakshmi & Ganesha",
    collection: "photo-frames",
    material: "Silver with Wood Frame",
    finishes: ["24K Gold Coated"],
    sizes: sizeSet([
      ['10" × 10"', 10, 0],
      ['14" × 14"', 14, 11000],
    ]),
    price: 16800,
    compareAtPrice: 21000,
    images: [frameLakshmiGanesha, frameGanesha],
    rating: 4.8,
    reviewCount: 108,
    stock: 3,
    tags: ["most-gifted", "best-seller"],
    shortDescription:
      "The Deepavali pair in full 24K gold coating, side by side on velvet in a rosewood frame.",
    description:
      "Lakshmi and Ganesha seated together — the pairing most families want on the pooja shelf for Deepavali and for a new home. Both reliefs are fully 24K gold coated over silver foil and set on deep maroon velvet inside a rosewood frame. Our highest-volume corporate gifting frame.",
    specs: frameSpecs("Solid rosewood", "1.4 kg"),
  },
  {
    id: "p9",
    slug: "tirupati-balaji-photo-frame",
    name: "Tirupati Balaji Photo Frame",
    figure: "Balaji",
    collection: "photo-frames",
    material: "Silver with Wood Frame",
    finishes: ["24K Gold Coated"],
    sizes: sizeSet([
      ['8" × 12"', 12, 0],
      ['12" × 18"', 18, 13500],
    ]),
    price: 15900,
    compareAtPrice: 19500,
    images: [frameBalaji, frameSaiBaba],
    rating: 4.8,
    reviewCount: 74,
    stock: 8,
    tags: ["trending", "new"],
    shortDescription:
      "Gold-coated Balaji relief under a temple arch, slim gold frame with a cream mount.",
    description:
      "The Balaji form set under a worked temple arch, with the namam hand-finished in colour after plating. A cream mount and slim gold-finished frame keep it contemporary enough for a study or an office wall, not only the pooja room.",
    specs: frameSpecs("Aluminium, brushed gold finish", "0.9 kg"),
  },
  {
    id: "p10",
    slug: "sai-baba-photo-frame",
    name: "Sai Baba Photo Frame",
    figure: "Sai Baba",
    collection: "photo-frames",
    material: "Silver with Wood Frame",
    finishes: ["24K Gold Coated", "Antique Silver"],
    sizes: sizeSet([
      ['9" × 12"', 12, 0],
      ['13" × 17"', 17, 12500],
    ]),
    price: 15200,
    compareAtPrice: 18800,
    images: [frameSaiBaba, frameBalaji],
    rating: 4.9,
    reviewCount: 91,
    stock: 10,
    tags: ["best-seller", "most-gifted"],
    shortDescription:
      "Gold-coated Sai Baba portrait relief under a cusped arch, in an ornately carved wooden frame.",
    description:
      "The seated blessing pose, embossed in silver foil and fully gold coated, set under a cusped arch on maroon velvet. The frame is carved with a running floral border and crowned with a pierced crest — the most traditional frame in the range.",
    specs: frameSpecs("Carved sheesham, crest top", "1.5 kg"),
  },
  {
    id: "p11",
    slug: "krishna-gold-coated-silver-photo-frame",
    name: "Krishna Gold Coated Silver Photo Frame",
    figure: "Krishna",
    collection: "photo-frames",
    material: "Silver with Wood Frame",
    finishes: ["Dual Tone"],
    sizes: sizeSet([
      ['8" × 10"', 10, 0],
      ['11" × 14"', 14, 9800],
    ]),
    price: 14200,
    compareAtPrice: 17500,
    images: [frameGanesha, gcsKrishna],
    rating: 4.7,
    reviewCount: 46,
    stock: 11,
    tags: ["new"],
    shortDescription:
      "Venugopala relief in dual-tone silver and gold, teak frame with velvet mount.",
    description:
      "Krishna at the flute, embossed in silver foil with the pitambara and garland gold coated for contrast. Framed in teak on maroon velvet. Frequently ordered alongside the Ganesha frame as a two-frame set for a pooja shelf.",
    specs: frameSpecs("Carved teak, walnut finish", "1.1 kg"),
  },
  {
    id: "p12",
    slug: "lakshmi-gold-coated-silver-photo-frame",
    name: "Lakshmi Gold Coated Silver Photo Frame",
    figure: "Lakshmi",
    collection: "photo-frames",
    material: "Silver with Wood Frame",
    finishes: ["24K Gold Coated", "Dual Tone"],
    sizes: sizeSet([
      ['8" × 10"', 10, 0],
      ['11" × 14"', 14, 9800],
      ['16" × 20"', 20, 25000],
    ]),
    price: 14900,
    compareAtPrice: 18400,
    images: [frameLakshmiGanesha, gcsLakshmi],
    rating: 4.8,
    reviewCount: 68,
    stock: 2,
    tags: ["new", "most-gifted"],
    shortDescription:
      "Seated Lakshmi showering coins, gold coated on velvet in a rosewood frame.",
    description:
      "Lakshmi seated on the lotus with coins falling from her lower palm — the form most asked for by shops and family businesses for the Deepavali account-opening puja. Gold coated over silver foil, rosewood frame, easel and hook included.",
    specs: frameSpecs("Solid rosewood", "1.2 kg"),
  },
];

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  photo?: string;
}

export const reviews: Review[] = [
  {
    id: "r1",
    productSlug: "siddhi-ganesha-gold-coated-silver-idol",
    author: "Meera Raghavan",
    city: "Chennai",
    rating: 5,
    date: "12 Jun 2026",
    title: "The gold work is genuinely hand laid",
    body: "You can see where the chasing tool has gone around the crown before plating. Six months on the silver has not dulled at all.",
    photo: gcsGanesha,
  },
  {
    id: "r2",
    productSlug: "siddhi-ganesha-gold-coated-silver-idol",
    author: "Arun Prakash",
    city: "Bengaluru",
    rating: 4,
    date: "2 Jun 2026",
    title: "Heavier than expected, packaging excellent",
    body: "Double-boxed with foam moulding and the purity certificate inside. The dual tone is slightly warmer than the photos, which I prefer.",
    photo: gcsLakshmi,
  },
  {
    id: "r3",
    productSlug: "gajalakshmi-gold-coated-silver-idol",
    author: "Kavitha Iyer",
    city: "Coimbatore",
    rating: 5,
    date: "28 May 2026",
    title: "Bought for a gruhapravesham",
    body: "The gold lotus base catches the lamp light beautifully. It has become the centre of their pooja room.",
    photo: gcsLakshmi,
  },
  {
    id: "r4",
    productSlug: "lakshmi-ganesha-pair-photo-frame",
    author: "Col. R. Sharma",
    city: "New Delhi",
    rating: 5,
    date: "19 May 2026",
    title: "Ordered 40 frames for a felicitation",
    body: "Kyathi engraved all forty backs and delivered in eleven days. Not one frame damaged in transit.",
    photo: frameLakshmiGanesha,
  },
  {
    id: "r5",
    productSlug: "ganesha-gold-coated-silver-photo-frame",
    author: "Nikhil Desai",
    city: "Pune",
    rating: 5,
    date: "8 May 2026",
    title: "Stands and hangs, both work",
    body: "Used the easel first, then moved it to the wall — the hook was already in the box. The velvet mount looks far richer in person.",
    photo: frameGanesha,
  },
  {
    id: "r6",
    productSlug: "tirupati-balaji-gold-coated-silver-idol",
    author: "Srinivas Reddy",
    city: "Hyderabad",
    rating: 5,
    date: "30 Apr 2026",
    title: "Garland detail is remarkable",
    body: "Five separate layers of garland, all crisp after plating. It sits in our mandir cabinet and needs no cleaning, only a dry wipe.",
    photo: gcsBalaji,
  },
];

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  product: string;
  quote: string;
  photo: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Meera Raghavan",
    city: "Chennai",
    product: "Siddhi Ganesha Gold Coated Silver Idol",
    quote:
      "I have bought silver idols for twenty years. This is the first one where the gold coating still looks laid on by hand a year later.",
    photo: gcsGanesha,
    rating: 5,
  },
  {
    id: "t2",
    name: "Kavitha Iyer",
    city: "Coimbatore",
    product: "Gajalakshmi Gold Coated Silver Idol",
    quote:
      "A gruhapravesham gift for my daughter. She has moved it three times around the house to find the right lamp light for it.",
    photo: gcsLakshmi,
    rating: 5,
  },
  {
    id: "t3",
    name: "Col. R. Sharma",
    city: "New Delhi",
    product: "Lakshmi Ganesha Pair Photo Frame",
    quote:
      "Forty engraved frames, eleven days, zero breakage. The corporate desk actually answers the phone.",
    photo: frameLakshmiGanesha,
    rating: 5,
  },
  {
    id: "t4",
    name: "Nikhil Desai",
    city: "Pune",
    product: "Ganesha Gold Coated Silver Photo Frame",
    quote:
      "Guests assume the frame came from a jeweller in Jaipur. Then they pick it up and feel the weight of it.",
    photo: frameGanesha,
    rating: 4.5,
  },
];

export interface Store {
  id: string;
  name: string;
  address: string;
  timing: string;
  phone: string;
  image: string;
  mapsUrl: string;
}

export const STORE_ADDRESS =
  "Radhakrishna Building, Near Rotary Blood Bank, Puttur - 574201";

export const stores: Store[] = [
  {
    id: "s1",
    name: "Kyathi heritage — Flagship Studio",
    address: STORE_ADDRESS,
    timing: "Mon\u2013Sun \u00b7 10:00 AM \u2013 8:30 PM",
    phone: "+91 95915 17282",
    image: heroIdols,
    mapsUrl:
      "https://maps.google.com/?q=Radhakrishna+Building+Near+Rotary+Blood+Bank+Puttur+574201",
  },
];

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  ctaLabel: string;
  /** either a collection slug or a static page path */
  ctaSlug?: CollectionSlug;
  ctaTo?: "/custom-sculpture" | "/corporate-gifting";
  image: string;
  align: "left" | "right";
}

export const heroSlides: HeroSlide[] = [
  {
    id: "h1",
    eyebrow: "Gold Coated Silver Idols",
    title: "999 silver. 24 karat gold. One pair of hands.",
    copy: "Idols cast in pure silver, chased by hand, then coated in 24K gold and sealed against tarnish.",
    ctaLabel: "Shop gold coated idols",
    ctaSlug: "gold-coated-silver",
    image: heroIdols,
    align: "left",
  },
  {
    id: "h2",
    eyebrow: "Idols with Photo Frames",
    title: "The deity, framed and ready for the wall",
    copy: "Gold-coated silver reliefs on maroon velvet, in carved teak and rosewood frames. Easel and hook included.",
    ctaLabel: "Shop photo frames",
    ctaSlug: "photo-frames",
    image: heroFrames,
    align: "right",
  },
  {
    id: "h3",
    eyebrow: "Made to order",
    title: "Your deity. Your size. Your finish.",
    copy: "Custom gold-coated silver idols and framed reliefs, approved at the wax stage before we plate.",
    ctaLabel: "Start a custom order",
    ctaTo: "/custom-sculpture",
    image: heroIdols,
    align: "left",
  },
  {
    id: "h4",
    eyebrow: "Corporate Gifting",
    title: "Gifts that outlast the financial year",
    copy: "Engraved silver frames and idols, bulk-priced, delivered pan-India with a dedicated manager.",
    ctaLabel: "Corporate gifting",
    ctaTo: "/corporate-gifting",
    image: heroFrames,
    align: "right",
  },
];

export const navigation: { label: string; to: string; params?: { slug: string } }[] = [
  { label: "New Launches", to: "/collections/$slug", params: { slug: "new-launches" } },
  {
    label: "Gold Coated Silver Idols",
    to: "/collections/$slug",
    params: { slug: "gold-coated-silver" },
  },
  { label: "Photo Frame Idols", to: "/collections/$slug", params: { slug: "photo-frames" } },
  { label: "Custom Orders", to: "/custom-sculpture" },
  { label: "Corporate Gifting", to: "/corporate-gifting" },
];
