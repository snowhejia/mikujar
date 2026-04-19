/**
 * 笔记设置「对象类型」目录。
 * 「类型」平铺为独立顶层类型；有子类型的在下方分块展示，无子类型的仅占顶层一格。
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

/** 类型分组：顶层类型一张卡 + 其下子类型列表（子类型为空则仅顶层卡，无下方 section） */
export type PresetTypeGroup = {
  baseId: string;
  baseLabelZh: string;
  baseLabelEn: string;
  baseEmoji: string;
  baseTint: string;
  children: PresetObjectTypeItem[];
};

/** 顶层类型（平铺）+ 各类型下子类型 */
export const PRESET_OBJECT_TYPES_GROUPS: PresetTypeGroup[] = [
  {
    baseId: "note",
    baseLabelZh: "笔记",
    baseLabelEn: "Note",
    baseEmoji: "📝",
    baseTint: "rgba(91, 141, 239, 0.18)",
    children: [
      {
        id: "note_standard",
        nameZh: "标准笔记",
        nameEn: "Standard note",
        emoji: "📝",
        tint: "rgba(91, 141, 239, 0.18)",
      },
      {
        id: "note_daily",
        nameZh: "每日笔记",
        nameEn: "Daily note",
        emoji: "📅",
        tint: "rgba(14, 165, 233, 0.14)",
      },
    ],
  },
  {
    baseId: "file",
    baseLabelZh: "文件",
    baseLabelEn: "File",
    baseEmoji: "📎",
    baseTint: "rgba(55, 53, 47, 0.1)",
    children: [
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
    ],
  },
  {
    baseId: "topic",
    baseLabelZh: "主题",
    baseLabelEn: "Topic",
    baseEmoji: "🎯",
    baseTint: "rgba(124, 58, 237, 0.14)",
    children: [],
  },
  {
    baseId: "task",
    baseLabelZh: "任务",
    baseLabelEn: "Task",
    baseEmoji: "☑",
    baseTint: "rgba(34, 197, 94, 0.14)",
    children: [
      {
        id: "task_todo",
        nameZh: "待办",
        nameEn: "Todo",
        emoji: "☑",
        tint: "rgba(34, 197, 94, 0.14)",
      },
      {
        id: "task_project",
        nameZh: "项目",
        nameEn: "Project",
        emoji: "📁",
        tint: "rgba(14, 165, 233, 0.12)",
      },
    ],
  },
  {
    baseId: "web",
    baseLabelZh: "网页",
    baseLabelEn: "Web",
    baseEmoji: "🌐",
    baseTint: "rgba(37, 99, 235, 0.12)",
    children: [
      {
        id: "web_link",
        nameZh: "链接",
        nameEn: "Link",
        emoji: "🔗",
        tint: "rgba(37, 99, 235, 0.12)",
      },
      {
        id: "web_clip",
        nameZh: "剪藏",
        nameEn: "Clip / bookmark",
        emoji: "🔖",
        tint: "rgba(59, 130, 246, 0.12)",
      },
    ],
  },
  {
    baseId: "quote",
    baseLabelZh: "摘抄",
    baseLabelEn: "Quote",
    baseEmoji: "❝",
    baseTint: "rgba(239, 68, 68, 0.12)",
    children: [],
  },
  {
    baseId: "habit_log",
    baseLabelZh: "习惯打卡",
    baseLabelEn: "Habit log",
    baseEmoji: "✅",
    baseTint: "rgba(52, 211, 153, 0.14)",
    children: [],
  },
  {
    baseId: "event",
    baseLabelZh: "事件",
    baseLabelEn: "Event",
    baseEmoji: "📌",
    baseTint: "rgba(251, 191, 36, 0.16)",
    children: [],
  },
  {
    baseId: "place",
    baseLabelZh: "地点",
    baseLabelEn: "Place",
    baseEmoji: "📍",
    baseTint: "rgba(34, 197, 94, 0.12)",
    children: [],
  },
  {
    baseId: "expense",
    baseLabelZh: "开支",
    baseLabelEn: "Expense",
    baseEmoji: "💳",
    baseTint: "rgba(52, 211, 153, 0.12)",
    children: [],
  },
  {
    baseId: "idea",
    baseLabelZh: "灵感",
    baseLabelEn: "Idea",
    baseEmoji: "💡",
    baseTint: "rgba(250, 204, 21, 0.18)",
    children: [],
  },
  {
    baseId: "journal",
    baseLabelZh: "日记",
    baseLabelEn: "Journal",
    baseEmoji: "📔",
    baseTint: "rgba(180, 83, 9, 0.12)",
    children: [],
  },
  {
    baseId: "account",
    baseLabelZh: "账户",
    baseLabelEn: "Account",
    baseEmoji: "🏦",
    baseTint: "rgba(59, 130, 246, 0.12)",
    children: [],
  },
  {
    baseId: "course",
    baseLabelZh: "课程",
    baseLabelEn: "Course",
    baseEmoji: "🎓",
    baseTint: "rgba(99, 102, 241, 0.12)",
    children: [],
  },
  {
    baseId: "tool",
    baseLabelZh: "工具",
    baseLabelEn: "Tool",
    baseEmoji: "🛠",
    baseTint: "rgba(55, 53, 47, 0.1)",
    children: [],
  },
];

/** 推荐预设（人物、组织、作品、投稿等） */
export const PRESET_OBJECT_TYPES_RECOMMENDED: PresetObjectRow[] = [
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
];

/** 顶层「类型」网格：每个父类型一张卡（与下方子类型 section 对应） */
export function presetTypeParentCard(group: PresetTypeGroup): PresetObjectTypeItem {
  return {
    id: group.baseId,
    nameZh: group.baseLabelZh,
    nameEn: group.baseLabelEn,
    emoji: group.baseEmoji,
    tint: group.baseTint,
  };
}
