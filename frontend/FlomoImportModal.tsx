import { useAppChrome } from "./i18n/useAppChrome";
import { parseFlomoExportDirectory } from "./import/parseFlomoExport";
import {
  SimpleImportModal,
  type SimpleImportModalProps,
  type SimpleImportProgress,
} from "./import/SimpleImportModal";

export type FlomoImportProgress = SimpleImportProgress;

type FlomoImportModalProps = Omit<
  SimpleImportModalProps,
  "parseDirectory" | "titleId" | "title" | "hint" | "errNone"
>;

export function FlomoImportModal(props: FlomoImportModalProps) {
  const c = useAppChrome();
  return (
    <SimpleImportModal
      {...props}
      parseDirectory={parseFlomoExportDirectory}
      titleId="flomo-import-title"
      title={c.importFlomoTitle}
      hint={c.importFlomoHint}
      errNone={c.importFlomoErrNone}
    />
  );
}
