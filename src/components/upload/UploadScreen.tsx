import { useAppState } from "../../context/AppContext";
import { useFileImport } from "../../hooks/useFileImport";
import { DropZone } from "./DropZone";
import { ImportGuide } from "./ImportGuide";
import { ImportProgress } from "./ImportProgress";
import { PrivacyBadge } from "../shared/PrivacyBadge";
import styles from "./UploadScreen.module.css";

export function UploadScreen() {
  const { isImporting, importProgress, importError } = useAppState();
  const importFile = useFileImport();

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <PrivacyBadge />
        <h1 className={styles.title}>Amazon Order Lens</h1>
        <p className={styles.subtitle}>
          Lade deinen Amazon-GDPR-Export hoch und erhalte sofort detaillierte
          Einblicke in dein Kaufverhalten. Alles läuft ausschließlich in deinem
          Browser — keine Daten verlassen dein Gerät.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <DropZone onFile={importFile} />
        {(isImporting || importError) && (
          <ImportProgress progress={importProgress} error={importError} />
        )}
      </div>
      <div>
        <ImportGuide />
      </div>
    </div>
  );
}
