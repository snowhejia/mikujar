#!/usr/bin/env bash
# 将源 PostgreSQL 库导出为自定义格式，并恢复到目标连接串（默认先 --clean 再导入）。
#
# 典型用法（在 server 目录下）：
#   export TARGET_DATABASE_URL='postgresql://USER:PASS@HOST:PORT/DB?sslmode=require'
#   ./scripts/sync-db-to-url.sh
#   # 源库默认读 .env 里的 DATABASE_URL；也可显式指定：
#   SOURCE_DATABASE_URL='postgresql://...' ./scripts/sync-db-to-url.sh
#
# 也可把目标串作为第一个参数（勿将含密码的命令写进 shell 历史时可改用仅环境变量）：
#   ./scripts/sync-db-to-url.sh 'postgresql://USER:PASS@HOST:PORT/railway'
#
# 客户端版本：pg_dump 主版本须 ≥ 源库主版本（源为 PG18 而 brew 只有 17 时会失败）。
# 可下载 EDB 二进制包解压后指定：
#   export PG_BINDIR='/path/to/pgsql/bin'
#   下载示例（macOS）：https://get.enterprisedb.com/postgresql/postgresql-18.3-1-osx-binaries.zip
#
# 可选环境变量：
#   SOURCE_DATABASE_URL  源（默认：server/.env 的 DATABASE_URL）
#   TARGET_DATABASE_URL  目标（必填，除非第一个参数传入）
#   PG_BINDIR            含 pg_dump、pg_restore 的目录（优先于 PATH）
#   KEEP_DUMP=1          保留临时 .dump 文件并打印路径（默认删）
#   SYNC_DB_NO_CLEAN=1   恢复时不加 --clean（不删目标已有对象，易冲突，慎用）
#   SYNC_DB_VERBOSE=1    pg_restore --verbose
#
set -euo pipefail

SERVER_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$SERVER_ROOT/.env"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a
fi

TARGET_URL="${TARGET_DATABASE_URL:-}"
if [[ -n "${1:-}" ]]; then
  TARGET_URL="$1"
  shift || true
fi

SOURCE_URL="${SOURCE_DATABASE_URL:-${DATABASE_URL:-}}"

if [[ -z "$SOURCE_URL" ]]; then
  echo "❌ 请设置 SOURCE_DATABASE_URL 或在 $ENV_FILE 中配置 DATABASE_URL"
  exit 1
fi
if [[ -z "$TARGET_URL" ]]; then
  echo "❌ 请设置 TARGET_DATABASE_URL，或将目标连接串作为第一个参数传入"
  exit 1
fi

resolve_pg_bindir() {
  if [[ -n "${PG_BINDIR:-}" ]]; then
    if [[ -x "$PG_BINDIR/pg_dump" && -x "$PG_BINDIR/pg_restore" ]]; then
      echo "$PG_BINDIR"
      return 0
    fi
    echo "❌ PG_BINDIR 已设置但缺少可执行的 pg_dump/pg_restore: $PG_BINDIR" >&2
    exit 1
  fi
  local p v
  for v in 18 17 16 15 14; do
    for p in "/opt/homebrew/opt/postgresql@${v}/bin" "/usr/local/opt/postgresql@${v}/bin"; do
      if [[ -x "$p/pg_dump" && -x "$p/pg_restore" ]]; then
        echo "$p"
        return 0
      fi
    done
  done
  if command -v pg_dump >/dev/null 2>&1 && command -v pg_restore >/dev/null 2>&1; then
    dirname "$(command -v pg_dump)"
    return 0
  fi
  echo "❌ 未找到 pg_dump / pg_restore。请安装 PostgreSQL 客户端或设置 PG_BINDIR。" >&2
  exit 1
}

PG_BIN="$(resolve_pg_bindir)"
PG_DUMP="$PG_BIN/pg_dump"
PG_RESTORE="$PG_BIN/pg_restore"

server_major() {
  psql "$1" -tAc "SELECT current_setting('server_version_num')::int / 10000;" 2>/dev/null | tr -d '[:space:]'
}

client_major() {
  "$PG_DUMP" --version | sed -n 's/.*PostgreSQL[^0-9]*\([0-9][0-9]*\).*/\1/p'
}

if ! command -v psql >/dev/null 2>&1; then
  echo "❌ 需要 psql 以检测源库版本（与 pg_dump 同套件安装即可）"
  exit 1
fi

S_MAJ="$(server_major "$SOURCE_URL")"
C_MAJ="$(client_major)"

if [[ -z "$S_MAJ" ]]; then
  echo "❌ 无法连接源库或读取版本，请检查 SOURCE_DATABASE_URL / 网络"
  exit 1
fi
if [[ "$C_MAJ" -lt "$S_MAJ" ]]; then
  echo "❌ 源库为 PostgreSQL ${S_MAJ}，当前 pg_dump 主版本为 ${C_MAJ}（须 ≥ ${S_MAJ}）。" >&2
  echo "   可安装更高版本客户端，或设置 PG_BINDIR 指向 PostgreSQL ${S_MAJ} 的 bin（见脚本头注释）。" >&2
  exit 1
fi

DUMP_FILE="$(mktemp "${TMPDIR:-/tmp}/pg-sync-XXXXXX.dump")"
cleanup() {
  if [[ "${KEEP_DUMP:-}" == "1" ]]; then
    echo "📎 已保留 dump: $DUMP_FILE"
  else
    rm -f "$DUMP_FILE"
  fi
}
trap cleanup EXIT

echo "📤 pg_dump 源库 (PG $S_MAJ) → $DUMP_FILE"
echo "   客户端: $PG_DUMP ($("$PG_DUMP" --version | head -1))"
"$PG_DUMP" "$SOURCE_URL" -Fc --no-owner --no-acl -f "$DUMP_FILE"

RESTORE_ARGS=(--no-owner --no-acl -d "$TARGET_URL")
if [[ "${SYNC_DB_NO_CLEAN:-}" != "1" ]]; then
  RESTORE_ARGS=(--clean --if-exists "${RESTORE_ARGS[@]}")
else
  echo "⚠️  已跳过 --clean，若目标库已有同名对象可能失败"
fi
if [[ "${SYNC_DB_VERBOSE:-}" == "1" ]]; then
  RESTORE_ARGS=(--verbose "${RESTORE_ARGS[@]}")
fi

echo "📥 pg_restore → 目标库"
"$PG_RESTORE" "${RESTORE_ARGS[@]}" "$DUMP_FILE"

echo "✅ 完成。可自检，例如："
echo "   psql \"\$TARGET_DATABASE_URL\" -c 'SELECT count(*) AS cards FROM cards;'"
