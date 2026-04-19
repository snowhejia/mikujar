/**
 * 将带 bilibili 标签的笔记（扩展抓取：custom_props 中文「作者」）与人物预设合集下的人物卡关联，
 * 并写入 sf-bili-author（cardLink）+ creator 双边。人物名称写入属性 sf-person-name（非正文）。
 * 会顺带把「正文仅一行标题」的旧人物卡迁入 sf-person-name 并清空正文。
 *
 * 用法（在 server 目录、DATABASE_URL 已配置）：
 *   node scripts/backfill-bilibili-person-cards.mjs --dry-run
 *   node scripts/backfill-bilibili-person-cards.mjs
 *   node scripts/backfill-bilibili-person-cards.mjs --user-id=<用户 id>
 *
 * --dry-run：只统计，不写库；若尚无「人物」预设合集，不会自动创建，部分笔记会计入 skippedNoPersonCollection。
 * 正式执行时会按需创建人物预设合集（与 migrate-attachments-all-users 行为类似）。
 */
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

import { backfillBilibiliCreatorsAsPersonCards } from "../src/storage-pg.js";

function parseArgs(argv) {
  let dryRun = false;
  /** @type {string|undefined} */
  let userIdArg;
  for (const a of argv) {
    if (a === "--dry-run") dryRun = true;
    else if (a === "--user-id=null" || a === "--user-id=") userIdArg = null;
    else if (a.startsWith("--user-id=")) userIdArg = a.slice("--user-id=".length).trim();
  }
  return { dryRun, userIdArg };
}

async function main() {
  const { dryRun, userIdArg } = parseArgs(process.argv.slice(2));
  /** @type {{ userId?: string|null, dryRun?: boolean }} */
  const opts = { dryRun };
  if (userIdArg !== undefined) {
    opts.userId = userIdArg;
  }
  const stats = await backfillBilibiliCreatorsAsPersonCards(opts);
  console.error(`[backfill-bilibili-person-cards] ${JSON.stringify({ ...opts, stats })}`);
  console.log(JSON.stringify(stats));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
