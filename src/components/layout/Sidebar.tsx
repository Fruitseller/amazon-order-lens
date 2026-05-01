import type { MouseEvent } from "react";
import { useAppDispatch, useAppState } from "../../context/AppContext";
import type { ViewId } from "../../types/state";
import { VIEW_LABELS_DE, VIEW_ORDER } from "../../utils/constants";
import { setHash, viewToHash } from "../../utils/hashRouter";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const { activeView } = useAppState();
  const dispatch = useAppDispatch();

  const onClickLink = (view: ViewId) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch({ type: "SET_VIEW", view });
    setHash(view);
  };

  return (
    <nav className={styles.sidebar} aria-label="Hauptnavigation">
      <div className={styles.brand}>
        <div className={styles.brandMark} aria-hidden="true">
          AL
        </div>
        <div>
          <div className={styles.brandName}>Amazon Order Lens</div>
          <div className={styles.brandSub}>Lokale Analyse</div>
        </div>
      </div>
      {VIEW_ORDER.map((view) => {
        const isActive = view === activeView;
        const classes = [styles.link, isActive ? styles.linkActive : ""]
          .filter(Boolean)
          .join(" ");
        return (
          <a
            key={view}
            href={viewToHash(view)}
            className={classes}
            aria-current={isActive ? "page" : undefined}
            onClick={onClickLink(view)}
          >
            {VIEW_LABELS_DE[view]}
          </a>
        );
      })}
    </nav>
  );
}
