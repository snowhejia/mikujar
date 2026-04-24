-- promote-archived-to-root.sql — 一次性执行。
--
-- 目的：把「已归档」合集从「笔记」preset 根的子合集提升为顶层特殊合集。
--
-- 背景：此前「已归档」挂在「笔记」下，面包屑会显示「笔记 / 已归档 / …」。
-- 改为顶层后，它与「笔记」「主题」「剪藏」平级，面包屑自然从「已归档」开始，
-- 也不再被「笔记」子树遍历（全部笔记列表、笔记计数）所包含。
--
-- 识别：按 name = '已归档' 定位；只有一行。

BEGIN;

UPDATE collections
   SET parent_id = NULL
 WHERE name = '已归档'
   AND parent_id IS NOT NULL;

COMMIT;
