import { lazy, Suspense } from "react";
import { useAppChrome } from "../i18n/useAppChrome";
import { noteBodyToHtml } from "./plainHtml";
import type { NoteCardTiptapProps } from "./NoteCardTiptapCore";

export type { NoteCardTiptapProps };

const NoteCardTiptapCore = lazy(() =>
  import("./NoteCardTiptapCore").then((m) => ({
    default: m.NoteCardTiptapCore,
  }))
);

/**
 * 卡片正文 chunk 懒加载；chunk 未到前可先渲染静态 HTML，利于 LCP。
 */
function NoteCardTiptapFallback(
  props: NoteCardTiptapProps & { ariaLabel: string }
) {
  const { id, value, canEdit, ariaLabel } = props;
  const html = noteBodyToHtml(value);
  return (
    <div
      className={
        canEdit
          ? "card__text-editor"
          : "card__text-editor card__text-editor--readonly"
      }
    >
      <div
        id={id}
        className="ProseMirror card__text"
        spellCheck={false}
        aria-label={ariaLabel}
        aria-multiline="true"
        aria-busy="true"
        {...(canEdit ? { role: "textbox" as const } : {})}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function NoteCardTiptap(props: NoteCardTiptapProps) {
  const c = useAppChrome();
  const ariaLabel = props.ariaLabel ?? c.uiNoteBodyAria;
  const merged = { ...props, ariaLabel };
  return (
    <Suspense fallback={<NoteCardTiptapFallback {...merged} />}>
      <NoteCardTiptapCore {...merged} />
    </Suspense>
  );
}
