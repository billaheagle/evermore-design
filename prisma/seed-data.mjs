// Original portfolio, used only by prisma/seed.mjs to populate the database
// on first run. After seeding, the database (edited via /admin) is the source
// of truth — this file is not imported by the app.
export const projects = [
  {
    slug: "master-bedroom-japandi",
    name: "Master Bedroom Japandi",
    location: "Cibubur",
    year: "2024",
    category: "Residential",
    scope: "Full Interior + Renovation",
    hero: "/img/master-bedroom-japandi/after.jpeg",
    before: "/img/master-bedroom-japandi/before.jpeg",
    after: "/img/master-bedroom-japandi/after.jpeg",
    concept:
      `The brief was to create a bedroom that feels like a private retreat. Deep timber tones, textured charcoal surfaces and warm layered lighting come together to create a space that is intimate, refined and effortlessly luxurious.
      Every detail is designed to feel seamless — proving that true luxury lies not in excess, but in atmosphere.`,
    gallery: [
      { src: "/img/master-bedroom-japandi/after.jpeg", wide: false },
      { src: "/img/master-bedroom-japandi/1.jpeg", wide: false },
      { src: "/img/master-bedroom-japandi/2.jpeg", wide: false },
      { src: "/img/master-bedroom-japandi/3.jpeg", wide: false },
    ],
  },
  {
    slug: "master-bedroom",
    name: "Master Bedroom",
    location: "East Jakarta",
    year: "2026",
    category: "Residential",
    scope: "Full Interior + Renovation",
    hero: "/img/master-bedroom/after.jpeg",
    before: "/img/master-bedroom/before.png",
    after: "/img/master-bedroom/after.jpeg",
    concept:
      `The brief was to create a space that feels effortlessly serene. Soft neutrals, warm timber and layered lighting bring a quiet sense of luxury, while subtle architectural details add depth without overwhelming the room.
      Timeless, calming and beautifully composed — designed to make every day feel a little more refined.`,
    gallery: [
      { src: "/img/master-bedroom/after.jpeg", wide: false },
      { src: "/img/master-bedroom/1.png", wide: false },
      { src: "/img/master-bedroom/2.jpeg", wide: false },
      { src: "/img/master-bedroom/3.png", wide: false },
    ],
  },
  {
    slug: "kid-bedroom-i",
    name: "Kid Bedroom I",
    location: "BSD City",
    year: "2026",
    category: "Residential",
    scope: "Interior Design + Renovation + Styling",
    hero: "/img/kid-bedroom-i/after.jpeg",
    before: "/img/kid-bedroom-i/before.png",
    after: "/img/kid-bedroom-i/after.jpeg",
    concept:
      `The brief was to make a compact room feel calm, capable and considered. A tailored bed, integrated storage and a built-in workspace work together in one seamless composition — balancing rest, focus and everyday living.
      Warm lighting and refined detailing soften the clean lines, creating a space that feels effortlessly organised and quietly premium.`,
    gallery: [
      { src: "/img/kid-bedroom-i/after.jpeg", wide: false },
      { src: "/img/kid-bedroom-i/1.jpeg", wide: false },
      { src: "/img/kid-bedroom-i/2.jpeg", wide: false },
    ],
  },
  {
    slug: "kid-bedroom-ii",
    name: "Kid Bedroom II",
    location: "East Jakarta",
    year: "2026",
    category: "Residential",
    scope: "Interior Design + Renovation + Styling",
    hero: "/img/kid-bedroom-ii/after.jpeg",
    before: "/img/kid-bedroom-ii/before.png",
    after: "/img/kid-bedroom-ii/after.jpeg",
    concept:
      `The brief was to create a room that could grow with its young owner. Playful details, soft lighting and personal touches are balanced with built-in storage and a dedicated study area — making space for imagination, focus and everything in between.
      Warm, practical and quietly refined, it’s a room designed for childhood today and the years ahead.`,
    gallery: [
      { src: "/img/kid-bedroom-ii/after.jpeg", wide: false },
      { src: "/img/kid-bedroom-ii/1.jpeg", wide: false },
      { src: "/img/kid-bedroom-ii/2.jpeg", wide: false },
    ],
  },
  {
    slug: "dining-room",
    name: "Dining Room",
    location: "BSD City",
    year: "2025",
    category: "Residential",
    scope: "Interior Design + Renovation + Styling",
    hero: "/img/dining-room/after.jpeg",
    before: "/img/dining-room/before.jpeg",
    after: "/img/dining-room/after.jpeg",
    concept:
      `The brief was to create a dining space that feels elevated yet effortless. Soft neutral finishes, dark timber accents and sculptural lighting come together to frame the table as the heart of the home.
      Refined enough to impress, yet warm enough to linger — designed for everyday dining and memorable gatherings alike.`,
    gallery: [
      { src: "/img/dining-room/after.jpeg", wide: false },
      { src: "/img/dining-room/1.jpeg", wide: false },
      { src: "/img/dining-room/2.jpeg", wide: false },
      { src: "/img/dining-room/3.jpeg", wide: false },
    ],
  },
  {
    slug: "kost-putri-bali",
    name: "Kost Putri Bali",
    location: "Bali",
    year: "2026",
    category: "Residential",
    scope: "Interior Design",
    hero: "/img/kost-putri-bali/after.jpeg",
    before: "",
    after: "/img/kost-putri-bali/after.jpeg",
    concept:
      `The brief was to make a compact room work harder without feeling crowded. A built-in study, open wardrobe and smart storage are seamlessly integrated to support both focus and everyday living.
      Warm timber, soft lighting and a calm palette bring it all together — proving that thoughtful design can make even the smallest spaces feel effortlessly refined.`,
    gallery: [
      { src: "/img/kost-putri-bali/after.jpeg", wide: false },
      { src: "/img/kost-putri-bali/1.jpeg", wide: false },
      { src: "/img/kost-putri-bali/2.jpeg", wide: false },
    ],
  },
  {
    slug: "walk-in-closet",
    name: "Walk in Closet",
    location: "Bintaro",
    year: "2026",
    category: "Residential",
    scope: "Interior Design",
    hero: "/img/walk-in-closet/after.jpeg",
    before: "",
    after: "/img/walk-in-closet/after.jpeg",
    concept:
      `The brief was to make organisation feel like an experience. Rich timber, smoked glass and integrated lighting transform everyday storage into a space that feels tailored, polished and quietly indulgent.
      Designed around visibility, order and effortless access — because luxury begins with having everything exactly where it belongs.`,
    gallery: [
      { src: "/img/walk-in-closet/after.jpeg", wide: false },
      { src: "/img/walk-in-closet/1.jpeg", wide: false },
      { src: "/img/walk-in-closet/2.jpeg", wide: false },
    ],
  },
];
