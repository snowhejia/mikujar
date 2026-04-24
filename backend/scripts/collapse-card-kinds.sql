-- collapse-card-kinds.sql — 一次性执行。
--
-- 目的：
--   1. 删除除 card_files 外的 9 张 1:1 子表（历史上只写空占位行，从未被读取/更新）
--   2. 把 card_types.kind 从 11 种值塌缩为 3 种：note / file / custom
--
-- 说明：
--   子表无真实数据需迁移。所有字段值实际上都存在 cards.custom_props JSONB 里。
--   前端使用 preset_slug 做路由，不依赖 card_types.kind，故无前端改动。

BEGIN;

DROP TABLE card_notes,
           card_bookmarks,
           card_topics,
           card_works,
           card_clips,
           card_tasks,
           card_projects,
           card_expenses,
           card_accounts
  CASCADE;

UPDATE card_types
   SET kind = 'custom'
 WHERE kind NOT IN ('note', 'file', 'custom');

ALTER TABLE card_types DROP CONSTRAINT card_types_kind_check;
ALTER TABLE card_types ADD CONSTRAINT card_types_kind_check
  CHECK (kind IN ('note', 'file', 'custom'));

COMMIT;
