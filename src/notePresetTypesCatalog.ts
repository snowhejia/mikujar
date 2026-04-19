/**
 * 笔记设置「对象类型」目录（与产品分层一致：基础 / 推荐预设 / 可选扩展）。
 * 展示用；后续与 object_kind、card_schema、图谱边绑定。
 */

export type PresetObjectTypeItem = {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  tint: string;
};

/** 推荐预设内用于分组小标题 */
export type PresetObjectSubhead = {
  kind: "subhead";
  id: string;
  nameZh: string;
  nameEn: string;
};

export type PresetObjectRow =
  | ({ kind: "item" } & PresetObjectTypeItem)
  | PresetObjectSubhead;

function item(
  x: PresetObjectTypeItem
): Extract<PresetObjectRow, { kind: "item" }> {
  return { kind: "item", ...x };
}

function subhead(
  id: string,
  nameZh: string,
  nameEn: string
): PresetObjectSubhead {
  return { kind: "subhead", id, nameZh, nameEn };
}

/** 第一层：基础类型 — 笔记、文件及文件子类（图/音/视/文档） */
export const PRESET_OBJECT_TYPES_BASIC: PresetObjectTypeItem[] = [
  {
    id: "note",
    nameZh: "笔记",
    nameEn: "Note",
    emoji: "📝",
    tint: "rgba(91, 141, 239, 0.18)",
  },
  {
    id: "file",
    nameZh: "文件",
    nameEn: "File",
    emoji: "📎",
    tint: "rgba(55, 53, 47, 0.1)",
  },
  {
    id: "file_image",
    nameZh: "图片",
    nameEn: "Image",
    emoji: "🖼",
    tint: "rgba(236, 72, 153, 0.12)",
  },
  {
    id: "file_video",
    nameZh: "视频",
    nameEn: "Video",
    emoji: "🎬",
    tint: "rgba(124, 58, 237, 0.14)",
  },
  {
    id: "file_audio",
    nameZh: "音频",
    nameEn: "Audio",
    emoji: "🎵",
    tint: "rgba(14, 165, 233, 0.14)",
  },
  {
    id: "file_document",
    nameZh: "文档",
    nameEn: "Document",
    emoji: "📄",
    tint: "rgba(55, 53, 47, 0.08)",
  },
];

/**
 * 第二层：推荐预设 — 含「作品」「投稿」子类型分组
 */
export const PRESET_OBJECT_TYPES_RECOMMENDED: PresetObjectRow[] = [
  item({
    id: "link",
    nameZh: "链接",
    nameEn: "Link",
    emoji: "🔗",
    tint: "rgba(37, 99, 235, 0.12)",
  }),
  item({
    id: "person",
    nameZh: "人物",
    nameEn: "Person",
    emoji: "🧑",
    tint: "rgba(249, 115, 22, 0.14)",
  }),
  item({
    id: "organization",
    nameZh: "组织",
    nameEn: "Organization",
    emoji: "🏢",
    tint: "rgba(234, 88, 12, 0.12)",
  }),
  subhead("work", "作品（子类型）", "Work (subtypes)"),
  item({
    id: "work_book",
    nameZh: "书籍",
    nameEn: "Book",
    emoji: "📚",
    tint: "rgba(139, 92, 246, 0.14)",
  }),
  item({
    id: "work_movie",
    nameZh: "影视",
    nameEn: "Movie / TV",
    emoji: "🎞",
    tint: "rgba(99, 102, 241, 0.14)",
  }),
  item({
    id: "work_anime",
    nameZh: "动漫",
    nameEn: "Anime",
    emoji: "✨",
    tint: "rgba(236, 72, 153, 0.12)",
  }),
  item({
    id: "work_music",
    nameZh: "音乐",
    nameEn: "Music",
    emoji: "🎼",
    tint: "rgba(16, 185, 129, 0.14)",
  }),
  item({
    id: "work_game",
    nameZh: "游戏",
    nameEn: "Game",
    emoji: "🎮",
    tint: "rgba(59, 130, 246, 0.14)",
  }),
  item({
    id: "work_article",
    nameZh: "文章",
    nameEn: "Article",
    emoji: "📰",
    tint: "rgba(55, 53, 47, 0.08)",
  }),
  subhead("post", "投稿（子类型）", "Post (subtypes)"),
  item({
    id: "post_xhs",
    nameZh: "小红书",
    nameEn: "Xiaohongshu",
    emoji: "📕",
    tint: "rgba(239, 68, 68, 0.12)",
  }),
  item({
    id: "post_bilibili",
    nameZh: "B 站",
    nameEn: "Bilibili",
    emoji: "📺",
    tint: "rgba(0, 161, 214, 0.14)",
  }),
  item({
    id: "post_other",
    nameZh: "其他平台",
    nameEn: "Other platforms",
    emoji: "📱",
    tint: "rgba(55, 53, 47, 0.08)",
  }),
  item({
    id: "task",
    nameZh: "任务",
    nameEn: "Task",
    emoji: "☑",
    tint: "rgba(34, 197, 94, 0.14)",
  }),
  item({
    id: "project",
    nameZh: "项目",
    nameEn: "Project",
    emoji: "📁",
    tint: "rgba(14, 165, 233, 0.12)",
  }),
  item({
    id: "quote",
    nameZh: "摘抄",
    nameEn: "Quote",
    emoji: "❝",
    tint: "rgba(239, 68, 68, 0.12)",
  }),
  item({
    id: "habit_log",
    nameZh: "习惯打卡",
    nameEn: "Habit log",
    emoji: "✅",
    tint: "rgba(52, 211, 153, 0.14)",
  }),
];

/** 第三层：可选扩展 */
export const PRESET_OBJECT_TYPES_OPTIONAL: PresetObjectTypeItem[] = [
  {
    id: "event",
    nameZh: "事件",
    nameEn: "Event",
    emoji: "📌",
    tint: "rgba(251, 191, 36, 0.16)",
  },
  {
    id: "place",
    nameZh: "地点",
    nameEn: "Place",
    emoji: "📍",
    tint: "rgba(34, 197, 94, 0.12)",
  },
  {
    id: "expense",
    nameZh: "开支",
    nameEn: "Expense",
    emoji: "💳",
    tint: "rgba(52, 211, 153, 0.12)",
  },
  {
    id: "idea",
    nameZh: "灵感",
    nameEn: "Idea",
    emoji: "💡",
    tint: "rgba(250, 204, 21, 0.18)",
  },
  {
    id: "journal",
    nameZh: "日记",
    nameEn: "Journal",
    emoji: "📔",
    tint: "rgba(180, 83, 9, 0.12)",
  },
  {
    id: "account",
    nameZh: "账户",
    nameEn: "Account",
    emoji: "🏦",
    tint: "rgba(59, 130, 246, 0.12)",
  },
  {
    id: "course",
    nameZh: "课程",
    nameEn: "Course",
    emoji: "🎓",
    tint: "rgba(99, 102, 241, 0.12)",
  },
  {
    id: "tool",
    nameZh: "工具",
    nameEn: "Tool",
    emoji: "🛠",
    tint: "rgba(55, 53, 47, 0.1)",
  },
];
