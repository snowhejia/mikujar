/**
 * 小红书页面结构会改版，以下选择器多路兜底；失败时仍尽量带回 og 元数据。
 */
function textOf(el) {
  return el?.innerText?.trim() || "";
}

function scrapeNotePage() {
  const ogTitle = document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute("content")
    ?.trim();
  const ogDesc = document
    .querySelector('meta[property="og:description"]')
    ?.getAttribute("content")
    ?.trim();

  const titleCandidates = [
    ogTitle,
    textOf(document.querySelector("#detail-title")),
    textOf(document.querySelector('[class*="title"][class*="note"]')),
    document.title?.replace(/\s*-\s*小红书\s*$/i, "").trim(),
  ].filter(Boolean);

  const title = titleCandidates[0] || "小红书笔记";

  const bodyCandidates = [
    textOf(document.querySelector("#detail-desc .note-text")),
    textOf(document.querySelector("#detail-desc")),
    textOf(document.querySelector(".note-text")),
    textOf(document.querySelector('[class*="note-text"]')),
    textOf(document.querySelector('[class*="desc"]')),
    ogDesc,
  ].filter(Boolean);

  const body = bodyCandidates[0] || "";

  /** 小红书正文里的表情包 / 小贴纸，不当作笔记配图 */
  function isEmojiOrStickerImg(img, src) {
    const low = String(src).toLowerCase();
    const urlHints = [
      "emoji",
      "sticker",
      "emoticon",
      "expression",
      "emotion",
      "/face/",
      "face_",
      "meme",
      "decorate",
      "decoration",
      "stickpack",
      "gifimage",
      "static-expression",
    ];
    if (urlHints.some((h) => low.includes(h))) return true;

    const cls = String(img.className || "").toLowerCase();
    if (
      /\bemoji\b|sticker|emoticon|expression|表情|decorate/.test(cls)
    ) {
      return true;
    }

    let p = img.parentElement;
    for (let d = 0; d < 4 && p; d++, p = p.parentElement) {
      const pc = String(p.className || "").toLowerCase();
      if (
        /\bemoji\b|sticker|emoticon|expression|表情|decorate|note-content-emoji/.test(
          pc
        )
      ) {
        return true;
      }
    }

    const alt = String(img.getAttribute("alt") || "").toLowerCase();
    if (alt.includes("表情") || alt.includes("emoji")) return true;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (nw > 0 && nh > 0 && nw <= 72 && nh <= 72) return true;

    try {
      const r = img.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.width <= 56 && r.height <= 56) {
        return true;
      }
    } catch {
      /* ignore */
    }

    return false;
  }

  const imgSelectors = [
    "#noteContainer img",
    ".swiper-slide img",
    ".note-content img",
    "#detail-desc img",
    "article img",
  ];
  const seen = new Set();
  const imageUrls = [];
  for (const sel of imgSelectors) {
    for (const img of document.querySelectorAll(sel)) {
      const src =
        img.currentSrc ||
        img.src ||
        img.dataset?.src ||
        img.getAttribute("data-original");
      if (!src || !/^https?:\/\//i.test(src)) continue;
      if (isEmojiOrStickerImg(img, src)) continue;
      const low = src.toLowerCase();
      if (
        low.includes("avatar") ||
        low.includes("icon") ||
        low.includes("1x1") ||
        low.includes("blank")
      ) {
        continue;
      }
      try {
        const u = new URL(src);
        if (u.pathname.length < 8) continue;
      } catch {
        continue;
      }
      if (seen.has(src)) continue;
      seen.add(src);
      imageUrls.push(src);
    }
  }

  /** 与「F12 搜 mp4」同类：依赖用户先播放过视频，资源才会出现在 Performance 里 */
  const videoUrls = collectLikelyMp4Urls();

  const pageUrl = location.href;
  return { title, body, imageUrls, videoUrls, pageUrl };
}

/** 从 Performance 资源列表里找 .mp4（网页版播放后常见） */
function collectPerformanceMp4Urls() {
  const out = [];
  const seen = new Set();
  try {
    const entries = performance.getEntriesByType("resource");
    for (const e of entries) {
      const name = e.name || "";
      if (!/\.mp4(\?|#|$)/i.test(name)) continue;
      if (!/^https?:\/\//i.test(name)) continue;
      if (seen.has(name)) continue;
      seen.add(name);
      out.push(name);
    }
  } catch {
    /* ignore */
  }
  return out;
}

/** video 标签上的直链（少数页面有） */
function collectVideoElementMp4Urls() {
  const out = [];
  const seen = new Set();
  for (const v of document.querySelectorAll("video")) {
    const src =
      v.currentSrc ||
      v.getAttribute("src") ||
      v.querySelector("source[src]")?.getAttribute("src");
    if (!src || !/^https?:\/\//i.test(src)) continue;
    if (!/\.mp4(\?|#|$)/i.test(src)) continue;
    if (seen.has(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

function collectLikelyMp4Urls() {
  const seen = new Set();
  const merged = [];
  for (const u of [
    ...collectPerformanceMp4Urls(),
    ...collectVideoElementMp4Urls(),
  ]) {
    if (seen.has(u)) continue;
    seen.add(u);
    merged.push(u);
  }
  return merged;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "SCRAPE") {
    try {
      sendResponse({ ok: true, data: scrapeNotePage() });
    } catch (e) {
      sendResponse({ ok: false, error: String(e?.message || e) });
    }
    return true;
  }
  return false;
});
