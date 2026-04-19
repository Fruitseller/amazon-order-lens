import { useAppState } from "../../context/AppContext";
import { useIndexedDB } from "../../hooks/useIndexedDB";
import { PrivacyBadge } from "../shared/PrivacyBadge";
import styles from "./Header.module.css";

export function Header() {
  const { isDataLoaded } = useAppState();
  const { clear } = useIndexedDB();

  const handleClear = async () => {
    if (!window.confirm("Alle lokalen Daten unwiderruflich löschen?")) return;
    await clear();
  };

  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Amazon Order Lens</h1>
      </div>
      <div className={styles.actions}>
        <PrivacyBadge />
        {isDataLoaded && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
          >
            Daten löschen
          </button>
        )}
      </div>
    </header>
  );
}
