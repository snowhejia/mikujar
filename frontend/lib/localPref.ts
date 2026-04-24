/**
 * 统一的 localStorage 偏好读写工具：
 * - safeGetItem / safeSetItem 包裹 try/catch + SSR 守卫
 * - createBooleanPref / createEnumPref 用于"一行声明一个偏好"
 *
 * 设计取舍：故意不缓存读取值——浏览器 localStorage 已是同步且足够快，
 * 缓存反而会引入跨标签同步的复杂度；当前用法都不在热路径。
 */

export function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    /* quota / 隐私模式 */
  }
}

export function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    /* 隐私模式 */
  }
}

export function safeSessionGetItem(key: string): string | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSessionSetItem(key: string, value: string): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(key, value);
  } catch {
    /* quota / 隐私模式 */
  }
}

/** 遍历删除所有匹配前缀的 sessionStorage key（隐私模式 / SSR 时静默） */
export function safeSessionRemoveItemsByPrefix(prefix: string): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(prefix)) sessionStorage.removeItem(k);
    }
  } catch {
    /* 隐私模式 */
  }
}

export type BooleanPref = {
  read: () => boolean;
  save: (on: boolean) => void;
};

/** 约定：以 "1" / "0" 字符串落地，trim 后比较 */
export function createBooleanPref(key: string, defaultValue = false): BooleanPref {
  return {
    read: () => {
      const raw = safeGetItem(key);
      if (raw === null) return defaultValue;
      return raw.trim() === "1";
    },
    save: (on) => safeSetItem(key, on ? "1" : "0"),
  };
}

export type EnumPref<T extends string> = {
  read: () => T;
  save: (value: T) => void;
};

/**
 * 字符串枚举偏好。读取时 trim，未匹配 allowed 列表则回退默认值。
 * @param allowed 允许的取值（运行时校验）
 */
export function createEnumPref<T extends string>(
  key: string,
  allowed: readonly T[],
  defaultValue: T
): EnumPref<T> {
  return {
    read: () => {
      const raw = safeGetItem(key)?.trim();
      if (!raw) return defaultValue;
      return (allowed as readonly string[]).includes(raw) ? (raw as T) : defaultValue;
    },
    save: (value) => safeSetItem(key, value),
  };
}
