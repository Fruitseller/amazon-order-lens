import { useEffect } from "react";
import { useAppDispatch, useAppState } from "../../context/AppContext";
import { useIndexedDB } from "../../hooks/useIndexedDB";
import { parseHash, setHash } from "../../utils/hashRouter";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { FilterBar } from "../filters/FilterBar";
import { OverviewView } from "../dashboard/OverviewView";
import { SpendingView } from "../dashboard/SpendingView";
import { PatternsView } from "../dashboard/PatternsView";
import { CategoriesView } from "../dashboard/CategoriesView";
import { FunFactsView } from "../dashboard/FunFactsView";
import { UploadScreen } from "../upload/UploadScreen";
import type { ViewId } from "../../types/state";
import styles from "./AppShell.module.css";

function viewFor(view: ViewId) {
  switch (view) {
    case "overview":
      return <OverviewView />;
    case "spending":
      return <SpendingView />;
    case "patterns":
      return <PatternsView />;
    case "categories":
      return <CategoriesView />;
    case "funfacts":
      return <FunFactsView />;
  }
}

export function AppShell() {
  const { isDataLoaded, activeView } = useAppState();
  const dispatch = useAppDispatch();
  useIndexedDB();

  useEffect(() => {
    const sync = () => {
      const next = parseHash(window.location.hash);
      dispatch({ type: "SET_VIEW", view: next });
    };
    window.addEventListener("hashchange", sync);
    if (window.location.hash) sync();
    return () => window.removeEventListener("hashchange", sync);
  }, [dispatch]);

  useEffect(() => {
    const expected = parseHash(window.location.hash);
    if (expected !== activeView) {
      setHash(activeView);
    }
  }, [activeView]);

  if (!isDataLoaded) {
    return (
      <div className={styles.uploadShell}>
        <UploadScreen />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.sidebarSlot}>
        <Sidebar />
      </div>
      <Header />
      <div className={styles.mainColumn}>
        <div className={styles.content}>
          <FilterBar />
          {viewFor(activeView)}
        </div>
      </div>
    </div>
  );
}
