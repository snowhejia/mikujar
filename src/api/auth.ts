import { getAdminToken } from "../auth/token";

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "user";
  avatarUrl: string;
};

function apiBase(): string {
  const b = import.meta.env.VITE_API_BASE as string | undefined;
  return b?.replace(/\/$/, "") ?? "";
}

/** 头像/上传路径：分域部署时补全为 API 域名 */
export function resolveMediaUrl(pathOrUrl: string): string {
  const p = pathOrUrl.trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const base = apiBase();
  if (!base) return p.startsWith("/") ? p : `/${p}`;
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
}

export async function fetchAuthStatus(): Promise<{
  writeRequiresLogin: boolean;
}> {
  const base = apiBase();
  try {
    const r = await fetch(`${base}/api/auth/status`);
    if (!r.ok) return { writeRequiresLogin: false };
    const j = (await r.json()) as { writeRequiresLogin?: unknown };
    return { writeRequiresLogin: Boolean(j.writeRequiresLogin) };
  } catch {
    return { writeRequiresLogin: false };
  }
}

export async function loginWithCredentials(
  username: string,
  password: string
): Promise<
  | { ok: true; token: string; user: AuthUser }
  | { ok: false; error: string }
> {
  const base = apiBase();
  try {
    const r = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    const j = (await r.json().catch(() => ({}))) as {
      token?: unknown;
      user?: unknown;
      error?: unknown;
    };
    if (!r.ok) {
      return {
        ok: false,
        error: typeof j.error === "string" ? j.error : "登录失败",
      };
    }
    if (typeof j.token !== "string" || !j.user || typeof j.user !== "object") {
      return { ok: false, error: "响应无效" };
    }
    const u = j.user as AuthUser;
    if (!u.id || !u.username) {
      return { ok: false, error: "响应无效" };
    }
    return { ok: true, token: j.token, user: u };
  } catch {
    return { ok: false, error: "网络错误" };
  }
}

export async function fetchAuthMe(): Promise<{
  ok: boolean;
  admin: boolean;
  user: AuthUser | null;
}> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, admin: false, user: null };
  }
  const base = apiBase();
  try {
    const r = await fetch(`${base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return { ok: false, admin: false, user: null };
    const j = (await r.json()) as {
      ok?: unknown;
      admin?: unknown;
      user?: AuthUser | null;
    };
    return {
      ok: Boolean(j.ok),
      admin: Boolean(j.admin),
      user: j.user ?? null,
    };
  } catch {
    return { ok: false, admin: false, user: null };
  }
}
