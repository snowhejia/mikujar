import type { Collection } from "./types";

function t(h: number, m: number) {
  return h * 60 + m;
}

function addDays(base: Date, deltaDays: number): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + deltaDays);
  return d;
}

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const now = new Date();
const D0 = ymdLocal(now);
const D1 = ymdLocal(addDays(now, -1));
const D2 = ymdLocal(addDays(now, -2));
const D3 = ymdLocal(addDays(now, -3));
const D4 = ymdLocal(addDays(now, -4));
const D5 = ymdLocal(addDays(now, -5));
const D7 = ymdLocal(addDays(now, -7));

/** English onboarding seed — same ids / media as zh for stable sync & refs */
export const collectionsEn: Collection[] = [
  {
    id: "c1",
    name: "Start · Mikujar tour",
    hint: "One note, one thing; features below are explained card by card. Switch collections on the left (study, quotes, journal…). Gray hint text: double‑click to make it yours.",
    dotColor: "#5e9fe8",
    children: [
      {
        id: "c1-am",
        name: "Sample · Sub‑folder (morning)",
        dotColor: "#fbbf24",
        cards: [
          {
            id: "intro-sub-am",
            minutesOfDay: t(9, 0),
            addedOn: D4,
            text: "【Sub‑folders】Open this folder in the tree — sub‑folders behave like top‑level ones on the timeline, with an extra level for scenes, projects, or moods.",
            media: [
              {
                kind: "image",
                url: "https://picsum.photos/seed/mikujar-sub-am-1/400/280",
              },
              {
                kind: "image",
                url: "https://picsum.photos/seed/mikujar-sub-am-2/400/280",
              },
            ],
          },
        ],
      },
      {
        id: "c1-pm",
        name: "Sample · Sub‑folder (evening)",
        dotColor: "#a78bfa",
        cards: [
          {
            id: "intro-sub-pm",
            minutesOfDay: t(22, 30),
            addedOn: D5,
            text: "【Sub‑folders】Put day vs night, work vs life in different buckets — switch folders to see the same day with a different lens.",
            media: [
              {
                kind: "image",
                url: "https://picsum.photos/seed/mikujar-sub-pm-1/400/280",
              },
              {
                kind: "image",
                url: "https://picsum.photos/seed/mikujar-sub-pm-2/400/280",
              },
              {
                kind: "image",
                url: "https://picsum.photos/seed/mikujar-sub-pm-3/400/280",
              },
            ],
          },
        ],
      },
    ],
    cards: [
      {
        id: "intro-verse",
        minutesOfDay: t(5, 20),
        addedOn: D0,
        text: "Days are scattered stars; gathered into one jar, they become your own galaxy.",
        media: [
          {
            kind: "image",
            url: "/微信图片_2026-03-30_201541_502.jpg",
          },
        ],
      },
      {
        id: "intro-timeline",
        minutesOfDay: t(6, 0),
        addedOn: D0,
        text: "【Timeline】Each note sits at a moment “today” — like ruled lines downward, no title required. Great for fragments: a thought, half a to‑do, a breeze you noticed.",
      },
      {
        id: "intro-pin",
        minutesOfDay: t(6, 2),
        addedOn: D0,
        text: "【Pin】Pin important cards to the top (pinned section), separate from the normal timeline. Use “⋯” on a card → Pin / Unpin.",
      },
      {
        id: "intro-tags",
        minutesOfDay: t(6, 4),
        addedOn: D0,
        text: "【Tags】Add tags under the body; filter from Tags in the sidebar. This card has two sample tags.",
        tags: ["Tour", "Tips"],
      },
      {
        id: "intro-media",
        minutesOfDay: t(6, 6),
        addedOn: D0,
        text: "【Attachments & carousel】Images, video, and files carousel on the right; tap thumbnails for lightbox. Add or clear more via “⋯”.",
        media: [
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-g1/480/320",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-g2/480/320",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-g3/480/320",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-g4/480/320",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-g5/480/320",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-g6/480/320",
          },
          {
            kind: "file",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            name: "sample-dummy.pdf",
          },
          {
            kind: "video",
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-g7/480/320",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-g8/480/320",
          },
        ],
      },
      {
        id: "intro-related-a",
        minutesOfDay: t(6, 8),
        addedOn: D0,
        text: "【Related notes】From “⋯” → Related notes to link other cards; the side panel jumps both ways. This card links to the next one.",
        relatedRefs: [{ colId: "c1", cardId: "intro-related-b" }],
      },
      {
        id: "intro-related-b",
        minutesOfDay: t(6, 10),
        addedOn: D0,
        text: "【Related notes】Open from the sidebar to jump to the note; one note can appear in several relations — handy for meeting notes and follow‑ups.",
        relatedRefs: [{ colId: "c1", cardId: "intro-related-a" }],
      },
      {
        id: "intro-links",
        minutesOfDay: t(6, 12),
        addedOn: D0,
        text: "【Links】http(s) or www. in the body become tappable; they open in a new tab. Tap body to edit; tap a link to follow.\nExample: https://developer.mozilla.org/en-US/",
      },
      {
        id: "intro-header-tools",
        minutesOfDay: t(6, 14),
        addedOn: D1,
        text: "【Top bar】Magnifier opens search; “+” creates a note in the current collection timeline (hidden in search or day view). Same new‑note control at the bottom of the list.",
      },
      {
        id: "intro-search",
        minutesOfDay: t(6, 16),
        addedOn: D1,
        text: "【Search】Matches body, tags, attachment names, collection titles… Tap Open in results to jump to the collection.",
      },
      {
        id: "intro-calendar",
        minutesOfDay: t(6, 18),
        addedOn: D1,
        text: "【Calendar】Dots on days with notes; tap a day to show only that day’s cards (grouped by collection). Sample data spans today, yesterday, and recent days — try tapping around.",
      },
      {
        id: "intro-hint",
        minutesOfDay: t(6, 20),
        addedOn: D1,
        text: "【Collection hint】The gray line under the title is this collection’s hint — double‑click to write your own tagline for each jar.",
      },
    ],
  },
  {
    id: "c2",
    name: "Study",
    hint: "Courses, terms, mistakes, reviews — add sub‑folders by week or topic.",
    dotColor: "#60a5fa",
    cards: [
      {
        id: "study-1",
        minutesOfDay: t(10, 5),
        addedOn: D2,
        text: "【How to use】In class or reading, jot the “conclusion right now” with the clock; outline later — doesn’t have to finish the same day.",
        tags: ["Method"],
      },
      {
        id: "study-2",
        minutesOfDay: t(15, 40),
        addedOn: D2,
        text: "Euler’s identity ties e, i, and π in one line: e^(iπ)+1=0 — algebra and geometry shaking hands on the same page.",
        tags: ["Math", "Quote"],
        media: [
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-study-a/440/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-study-b/440/300",
          },
        ],
      },
    ],
  },
  {
    id: "c3",
    name: "Quotes",
    hint: "Lines from books, films, lyrics — short is fine; page or chapter helps you find it again.",
    dotColor: "#f472b6",
    cards: [
      {
        id: "quote-1",
        minutesOfDay: t(20, 15),
        addedOn: D3,
        text: "“The moment we live is flanked by eternal night on both sides.” — Fernando Pessoa (swap in your shelf’s favorite)",
        media: [
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-quote-1/420/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-quote-2/420/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-quote-3/420/300",
          },
        ],
      },
    ],
  },
  {
    id: "c4",
    name: "Daily log",
    hint: "One day, one breath: drinks, people, weather — it all counts.",
    dotColor: "#34d399",
    cards: [
      {
        id: "daily-1",
        minutesOfDay: t(12, 30),
        addedOn: D0,
        text: "Lunch at a small noodle shop — sour soup, rain slanting on the glass — a good day to move half a beat slower.",
        tags: ["Life"],
        media: [
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-daily-1/440/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-daily-2/440/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-daily-3/440/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-daily-4/440/300",
          },
        ],
      },
    ],
  },
  {
    id: "c5",
    name: "Hobbies",
    hint: "Chord charts, recipe grams, which episode you’re on — hobbies deserve their own jar.",
    dotColor: "#fb923c",
    cards: [
      {
        id: "hobby-1",
        minutesOfDay: t(18, 0),
        addedOn: D3,
        text: "【Guitar】Fmaj7 finally rings clean — fingers still sore, but the strum feels like a smile.",
        tags: ["Music"],
        media: [
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-music-1/440/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-music-2/440/300",
          },
        ],
      },
      {
        id: "hobby-2",
        minutesOfDay: t(21, 10),
        addedOn: D7,
        text: "This week’s show “Light & City” — bring a wide lens; museum night hours Friday until 9.",
        tags: ["Exhibit", "Todo"],
        media: [
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-art-1/440/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-art-2/440/300",
          },
          {
            kind: "image",
            url: "https://picsum.photos/seed/mikujar-art-3/440/300",
          },
        ],
      },
    ],
  },
];
