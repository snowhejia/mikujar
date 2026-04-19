/**
 * 对库内每位「仍有 media 附件」的用户执行 batchMigrateAttachmentsToFileCards。
 * 若该用户尚无 preset_type_id=file 的合集，则自动创建（与设置里启用「文件」类型一致的最小元数据）。
 *
 * 用法：在 server 目录 DATABASE_URL 指向目标库后执行
 *   node scripts/migrate-attachments-all-users.mjs
 */
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

import { query } from "../src/db.js";
import {
  batchMigrateAttachmentsToFileCards,
  createCollection,
  updateCollection,
} from "../src/storage-pg.js";

const FILE_PRESET = "file";
/** 与 notePresetTypesCatalog 中 file 顶层 baseTint 一致 */
const FILE_DOT = "rgba(55, 53, 47, 0.1)";

/**
 * @param {string|null} userId
 */
async function ensureFileCollection(userId) {
  const ex =
    userId === null || userId === undefined
      ? await query(
          `SELECT id FROM collections WHERE user_id IS NULL AND preset_type_id = $1`,
          [FILE_PRESET]
        )
      : await query(
          `SELECT id FROM collections WHERE user_id = $1 AND preset_type_id = $2`,
          [userId, FILE_PRESET]
        );
  if (ex.rowCount > 0) return ex.rows[0].id;

  const id = `preset-${FILE_PRESET}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await createCollection(userId, {
    id,
    name: "文件",
    dotColor: FILE_DOT,
    parentId: null,
  });
  await updateCollection(userId, id, {
    isCategory: true,
    presetTypeId: FILE_PRESET,
    cardSchema: {},
  });
  return id;
}

async function main() {
  const r = await query(
    `SELECT DISTINCT user_id FROM cards
     WHERE trashed_at IS NULL
       AND user_id IS NOT NULL
       AND jsonb_array_length(COALESCE(media, '[]'::jsonb)) > 0`
  );
  const userIds = r.rows.map((x) => x.user_id);
  console.error(`[migrate-attachments-all-users] users with media cards: ${userIds.length}`);

  const total = { processed: 0, created: 0, skipped: 0 };

  for (const uid of userIds) {
    const fileCol = await ensureFileCollection(uid);
    const res = await batchMigrateAttachmentsToFileCards(uid, {
      fileCollectionId: fileCol,
      clearOriginalMedia: false,
    });
    console.error(`[migrate-attachments-all-users] ${JSON.stringify({ userId: uid, fileCol, ...res })}`);
    total.processed += res.processed;
    total.created += res.created;
    total.skipped += res.skipped;
  }

  const nullUsers = await query(
    `SELECT COUNT(*)::int AS n FROM cards
     WHERE trashed_at IS NULL
       AND user_id IS NULL
       AND jsonb_array_length(COALESCE(media, '[]'::jsonb)) > 0`
  );
  if (nullUsers.rows[0].n > 0) {
    const fileCol = await ensureFileCollection(null);
    const res = await batchMigrateAttachmentsToFileCards(null, {
      fileCollectionId: fileCol,
      clearOriginalMedia: false,
    });
    console.error(
      `[migrate-attachments-all-users] ${JSON.stringify({ userId: null, fileCol, ...res })}`
    );
    total.processed += res.processed;
    total.created += res.created;
    total.skipped += res.skipped;
  }

  console.error(`[migrate-attachments-all-users] TOTAL ${JSON.stringify(total)}`);
  console.log(JSON.stringify(total));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
