const REFERER = "https://www.xiaohongshu.com/";

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCardHtml({ title, body, pageUrl }) {
  const paras = body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  const link = pageUrl
    ? `<p><a href="${escapeHtml(pageUrl)}" rel="noreferrer">来源：小红书</a></p>`
    : "";
  return `<p><strong>${escapeHtml(title)}</strong></p>${paras || "<p>（无正文）</p>"}${link}`;
}

function newCardId() {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function appendUserId(url, userId) {
  const uid = String(userId || "").trim();
  if (!uid) return url;
  const u = new URL(url);
  u.searchParams.set("userId", uid);
  return u.toString();
}

async function getSettings() {
  const s = await chrome.storage.sync.get([
    "apiBase",
    "bearerToken",
    "userId",
    "collectionId",
  ]);
  const apiBase = String(s.apiBase || "")
    .trim()
    .replace(/\/$/, "");
  const bearerToken = String(s.bearerToken || "").trim();
  const userId = String(s.userId || "").trim();
  const collectionId = String(s.collectionId || "").trim();
  return { apiBase, bearerToken, userId, collectionId };
}

async function ensureApiPermission(apiBase) {
  let url;
  try {
    url = new URL(apiBase);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const originPattern = `${url.origin}/*`;
  const has = await chrome.permissions.contains({
    origins: [originPattern],
  });
  if (has) return true;
  return chrome.permissions.request({ origins: [originPattern] });
}

async function fetchAsBlob(imageUrl) {
  const r = await fetch(imageUrl, {
    headers: {
      Referer: REFERER,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
    credentials: "omit",
    mode: "cors",
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.blob();
}

function guessFilename(url, i) {
  try {
    const u = new URL(url);
    const base = u.pathname.split("/").pop() || "";
    if (base && /\.(jpe?g|png|gif|webp)$/i.test(base)) return base;
  } catch {
    /* ignore */
  }
  return `xhs-${i + 1}.jpg`;
}

function guessContentType(blob, filename) {
  if (blob.type && blob.type.startsWith("image/")) return blob.type;
  const low = filename.toLowerCase();
  if (low.endsWith(".png")) return "image/png";
  if (low.endsWith(".webp")) return "image/webp";
  if (low.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function guessVideoFilename(url, i) {
  try {
    const u = new URL(url);
    const base = u.pathname.split("/").pop() || "";
    if (base && /\.mp4$/i.test(base.split("?")[0])) return base.split("?")[0];
  } catch {
    /* ignore */
  }
  return `xhs-video-${i + 1}.mp4`;
}

function guessVideoContentType(blob, filename) {
  if (blob.type && blob.type.startsWith("video/")) return blob.type;
  const low = filename.toLowerCase();
  if (low.endsWith(".webm")) return "video/webm";
  if (low.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

async function presignAndUpload(apiBase, token, userId, blob, filename, contentType) {
  const pres = await fetch(appendUserId(`${apiBase}/api/upload/presign`, userId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
      contentType,
      fileSize: blob.size,
    }),
  });
  const pj = await pres.json().catch(() => ({}));
  if (!pres.ok) {
    throw new Error(pj.error || `预签名失败 ${pres.status}`);
  }
  if (pj.direct !== true || typeof pj.putUrl !== "string") {
    throw new Error(pj.error || "服务端未开启 COS 直传");
  }
  const putHeaders = { ...(pj.headers || {}) };
  const putRes = await fetch(pj.putUrl, {
    method: "PUT",
    headers: putHeaders,
    body: blob,
  });
  if (!putRes.ok) throw new Error(`上传 COS 失败 ${putRes.status}`);
  if (typeof pj.url !== "string" || !pj.url) throw new Error("无效上传响应");
  return {
    url: pj.url,
    kind: pj.kind || "image",
    name: typeof pj.name === "string" ? pj.name : filename,
  };
}

async function createCard(apiBase, token, userId, collectionId, card) {
  const r = await fetch(
    appendUserId(
      `${apiBase}/api/collections/${encodeURIComponent(collectionId)}/cards`,
      userId
    ),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(card),
    }
  );
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(j.error || `创建笔记失败 ${r.status}`);
  }
  return j;
}

/**
 * @param {number} tabId
 * @param {(msg: { type: string, value?: number, text?: string, ok?: boolean, message?: string }) => void} emit
 */
async function runSave(tabId, emit) {
  emit({ type: "progress", value: 5, text: "读取配置…" });
  const settings = await getSettings();
  if (!settings.apiBase || !settings.bearerToken || !settings.collectionId) {
    emit({
      type: "done",
      ok: false,
      message: "请先在「扩展选项」填写 API、Token、合集 ID。",
    });
    return;
  }

  emit({ type: "progress", value: 10, text: "检查 API 访问权限…" });
  const okPerm = await ensureApiPermission(settings.apiBase);
  if (!okPerm) {
    emit({
      type: "done",
      ok: false,
      message: "需要授权访问你的 API 域名；请打开选项页保存一次以触发授权。",
    });
    return;
  }

  emit({ type: "progress", value: 18, text: "抓取页面内容…" });
  let scraped;
  try {
    scraped = await chrome.tabs.sendMessage(tabId, { type: "SCRAPE" });
  } catch {
    emit({
      type: "done",
      ok: false,
      message: "无法读取页面：请刷新小红书笔记页后重试。",
    });
    return;
  }

  if (!scraped?.ok) {
    emit({
      type: "done",
      ok: false,
      message: scraped?.error || "抓取失败",
    });
    return;
  }

  const { title, body, imageUrls, videoUrls = [], pageUrl } = scraped.data;
  const media = [];
  const errors = [];

  const imgs = imageUrls || [];
  const vids = videoUrls || [];
  const totalUploads = imgs.length + vids.length;
  const uploadSpan = totalUploads > 0 ? 62 : 0;
  const baseAfterScrape = 25;

  function emitStepProgress(stepIndex, label) {
    const pct =
      totalUploads > 0
        ? baseAfterScrape +
          Math.round((uploadSpan * stepIndex) / Math.max(totalUploads, 1))
        : 86;
    emit({
      type: "progress",
      value: Math.min(pct, 85),
      text: label,
    });
  }

  for (let i = 0; i < imgs.length; i++) {
    const url = imgs[i];
    emitStepProgress(i, `图片 ${i + 1} / ${imgs.length}…`);
    try {
      const blob = await fetchAsBlob(url);
      if (blob.size < 200) continue;
      const filename = guessFilename(url, i);
      const contentType = guessContentType(blob, filename);
      const up = await presignAndUpload(
        settings.apiBase,
        settings.bearerToken,
        settings.userId,
        blob,
        filename,
        contentType
      );
      media.push({
        url: up.url,
        kind: up.kind === "video" ? "video" : "image",
        name: up.name || filename,
      });
    } catch (e) {
      errors.push(`图${i + 1}: ${e?.message || e}`);
    }
  }

  for (let j = 0; j < vids.length; j++) {
    const url = vids[j];
    emitStepProgress(
      imgs.length + j,
      `视频 ${j + 1} / ${vids.length}（大文件请稍候）…`
    );
    try {
      const blob = await fetchAsBlob(url);
      if (blob.size < 4096) continue;
      const filename = guessVideoFilename(url, j);
      const contentType = guessVideoContentType(blob, filename);
      const up = await presignAndUpload(
        settings.apiBase,
        settings.bearerToken,
        settings.userId,
        blob,
        filename,
        contentType
      );
      media.push({
        url: up.url,
        kind: up.kind === "video" ? "video" : "image",
        name: up.name || filename,
      });
    } catch (e) {
      errors.push(`视频${j + 1}: ${e?.message || e}`);
    }
  }

  emit({ type: "progress", value: 90, text: "创建笔记…" });
  const now = new Date();
  const minutesOfDay = now.getHours() * 60 + now.getMinutes();
  const card = {
    id: newCardId(),
    text: buildCardHtml({ title, body, pageUrl }),
    minutesOfDay,
    addedOn: todayYMD(),
    tags: ["小红书"],
    media,
  };

  try {
    await createCard(
      settings.apiBase,
      settings.bearerToken,
      settings.userId,
      settings.collectionId,
      card
    );
    const nImg = media.filter((m) => m.kind === "image").length;
    const nVid = media.filter((m) => m.kind === "video").length;
    let msg;
    if (media.length > 0) {
      const parts = [];
      if (nImg) parts.push(`${nImg} 张图`);
      if (nVid) parts.push(`${nVid} 个视频`);
      msg = `成功：已保存，${parts.join("、")}。`;
    } else if (errors.length > 0) {
      msg = `成功：正文已保存；附件失败 ${errors.length} 项（CDN/鉴权/未播放视频）。`;
    } else {
      msg =
        "成功：已保存（未抓到图片/视频；视频请先播放再点保存，或当前页仅为图文）。";
    }
    emit({ type: "progress", value: 100, text: msg });
    emit({ type: "done", ok: true, message: msg });
  } catch (e) {
    emit({
      type: "done",
      ok: false,
      message: String(e?.message || e),
    });
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "xhs-save") return;
  const emit = (data) => {
    try {
      port.postMessage(data);
    } catch {
      /* popup 已关闭 */
    }
  };
  port.onMessage.addListener((msg) => {
    if (msg?.type !== "start" || typeof msg.tabId !== "number") return;
    void (async () => {
      try {
        await runSave(msg.tabId, emit);
      } catch (e) {
        emit({ type: "done", ok: false, message: String(e?.message || e) });
      }
    })();
  });
});
