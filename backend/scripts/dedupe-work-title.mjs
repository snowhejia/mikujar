#!/usr/bin/env node
/**
 * dedupe-work-title.mjs:清理 work kind 旧版残留的 sf-work-title。
 *
 * 历史:storage-pg.js 旧版本对 kind='work' 的卡在 getEffectiveSchemaForCard
 * 里自动注入 sf-work-title schema 字段(name="标题"),与已经独立成 cards.title
 * 列的标题数据重复 → 前端属性面板显示两个"标题"行。已删除该兜底注入。
 *
 * 此脚本一次性清根:
 *  A) card_types.schema_json.fields 里 id='sf-work-title' 的字段移除
 *     (历史上有些用户类型已经把它实写进 schema_json,不只是运行时注入)
 *  B) cards.custom_props 里 id='sf-work-title' 的项,若 value 非空字符串且
 *     cards.title 为空 → 写入 cards.title,无论是否写入都从 custom_props 移除
 *  C) 幂等:再跑零变更
 *
 * 用法(在 backend 目录,已配置 .env / DATABASE_URL):
 *   node scripts/dedupe-work-title.mjs --dry-run    # 仅打印,不写库
 *   node scripts/dedupe-work-title.mjs              # 实跑
 *   node scripts/dedupe-work-title.mjs --include-trash  # 顺带处理已回收
 */
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DRY = process.argv.includes("--dry-run");
const INCLUDE_TRASH = process.argv.includes("--include-trash");
const TARGET_PROP_ID = "sf-work-title";

const { query, getClient, closePool } = await import("../src/db.js");

const stats = {
  cardTypesScanned: 0,
  cardTypesStripped: 0,
  cardsScanned: 0,
  cardsUnchanged: 0,
  titleWritten: 0,
  titleSkippedConflict: 0,
  propsRemoved: 0,
};

function stripFromSchemaFields(fields) {
  if (!Array.isArray(fields)) return { next: fields, removed: false };
  const next = fields.filter((f) => {
    if (!f || typeof f !== "object") return true;
    return f.id !== TARGET_PROP_ID;
  });
  return { next, removed: next.length !== fields.length };
}

function pickValueFromProps(props) {
  if (!Array.isArray(props)) return "";
  for (const p of props) {
    if (!p || typeof p !== "object") continue;
    if (p.id !== TARGET_PROP_ID) continue;
    const v = p.value;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function stripPropFromList(props) {
  if (!Array.isArray(props)) return { next: [], removed: 0 };
  const next = [];
  let removed = 0;
  for (const p of props) {
    if (p && typeof p === "object" && p.id === TARGET_PROP_ID) {
      removed += 1;
      continue;
    }
    next.push(p);
  }
  return { next, removed };
}

async function processCardTypes(client) {
  const rows = (
    await client.query(
      `SELECT id, name, kind, schema_json
       FROM card_types
       WHERE schema_json IS NOT NULL`
    )
  ).rows;
  for (const row of rows) {
    stats.cardTypesScanned += 1;
    const sj = row.schema_json;
    if (!sj || typeof sj !== "object") continue;
    const fields = Array.isArray(sj.fields) ? sj.fields : null;
    if (!fields) continue;
    const { next, removed } = stripFromSchemaFields(fields);
    if (!removed) continue;
    stats.cardTypesStripped += 1;
    if (DRY) {
      console.log(
        `  [DRY] card_type strip: id=${row.id} kind=${row.kind} name=${row.name}`
      );
      continue;
    }
    const newSchema = { ...sj, fields: next };
    await client.query(
      `UPDATE card_types SET schema_json = $1, updated_at = NOW() WHERE id = $2`,
      [newSchema, row.id]
    );
  }
}

async function processCards(client) {
  const trashClause = INCLUDE_TRASH ? "" : "AND c.trashed_at IS NULL";
  const rows = (
    await client.query(
      `SELECT c.id, c.user_id, c.title, c.custom_props, ct.kind
       FROM cards c
       LEFT JOIN card_types ct ON c.card_type_id = ct.id
       WHERE c.custom_props IS NOT NULL
         AND jsonb_typeof(c.custom_props) = 'array'
         ${trashClause}`
    )
  ).rows;
  for (const row of rows) {
    stats.cardsScanned += 1;
    const props = Array.isArray(row.custom_props) ? row.custom_props : [];
    const value = pickValueFromProps(props);
    const { next, removed } = stripPropFromList(props);
    if (removed === 0) {
      stats.cardsUnchanged += 1;
      continue;
    }
    const titleEmpty =
      typeof row.title !== "string" || row.title.trim() === "";
    let writeTitle = false;
    if (value && titleEmpty) {
      writeTitle = true;
      stats.titleWritten += 1;
    } else if (value && !titleEmpty && row.title.trim() !== value) {
      stats.titleSkippedConflict += 1;
    }
    stats.propsRemoved += removed;
    if (DRY) {
      console.log(
        `  [DRY] card strip: id=${row.id} kind=${row.kind} value="${value}" titleEmpty=${titleEmpty} writeTitle=${writeTitle}`
      );
      continue;
    }
    if (writeTitle) {
      await client.query(
        `UPDATE cards SET title = $1, custom_props = $2, updated_at = NOW() WHERE id = $3`,
        [value, JSON.stringify(next), row.id]
      );
    } else {
      await client.query(
        `UPDATE cards SET custom_props = $1, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(next), row.id]
      );
    }
  }
}

async function main() {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    await processCardTypes(client);
    await processCards(client);
    if (DRY) {
      await client.query("ROLLBACK");
      console.log("\n[DRY-RUN] 已回滚,未写库。");
    } else {
      await client.query("COMMIT");
      console.log("\n[APPLIED] 已提交。");
    }
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("迁移失败,已回滚:", e);
    process.exitCode = 1;
  } finally {
    client.release();
  }
  console.log("─".repeat(50));
  console.log("统计:");
  console.log(`  card_types 扫描: ${stats.cardTypesScanned}`);
  console.log(`  card_types 已清: ${stats.cardTypesStripped}`);
  console.log(`  cards     扫描: ${stats.cardsScanned}`);
  console.log(`  cards     无变: ${stats.cardsUnchanged}`);
  console.log(`  title 写入(原为空): ${stats.titleWritten}`);
  console.log(`  title 冲突跳过(已有不同值): ${stats.titleSkippedConflict}`);
  console.log(`  custom_props 项移除总数: ${stats.propsRemoved}`);
  await closePool();
}

main();
