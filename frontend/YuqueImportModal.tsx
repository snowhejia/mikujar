import { useAppChrome } from "./i18n/useAppChrome";
import { parseYuqueKnowledgeExportDirectory } from "./import/parseYuqueKnowledgeExport";
import {
  SimpleImportModal,
  type SimpleImportModalProps,
  type SimpleImportProgress,
} from "./import/SimpleImportModal";

export type YuqueImportProgress = SimpleImportProgress;

type YuqueImportModalProps = Omit<
  SimpleImportModalProps,
  "parseDirectory" | "titleId" | "title" | "hint" | "errNone"
>;

export function YuqueImportModal(props: YuqueImportModalProps) {
  const c = useAppChrome();
  return (
    <SimpleImportModal
      {...props}
      parseDirectory={parseYuqueKnowledgeExportDirectory}
      titleId="yuque-import-title"
      title={c.importYuqueTitle}
      hint={c.importYuqueHint}
      errNone={c.importYuqueErrNone}
    />
  );
}
