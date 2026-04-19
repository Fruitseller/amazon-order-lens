import { useAppDispatch, useAppState } from "../../context/AppContext";
import { DateRangeFilter } from "../shared/DateRangeFilter";
import { CATEGORY_LABELS_DE, CATEGORY_ORDER } from "../../utils/constants";
import type { ProductCategory } from "../../types/order";
import type { DateRange } from "../../types/state";
import styles from "./FilterBar.module.css";

export function FilterBar() {
  const { dateRange, selectedCategories, searchQuery } = useAppState();
  const dispatch = useAppDispatch();

  const setRange = (range: DateRange) =>
    dispatch({ type: "SET_DATE_RANGE", range });

  const toggleCategory = (category: ProductCategory) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    dispatch({ type: "SET_CATEGORIES", categories: next });
  };

  return (
    <div className={styles.bar}>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Zeitraum</div>
        <DateRangeFilter value={dateRange} onChange={setRange} />
      </div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Suche</div>
        <input
          type="search"
          role="searchbox"
          className={styles.search}
          placeholder="Produkt suchen …"
          value={searchQuery}
          onChange={(e) => dispatch({ type: "SET_SEARCH", query: e.target.value })}
        />
      </div>
      <fieldset
        className={styles.section}
        aria-label="Kategorien"
        style={{ border: 0, padding: 0, margin: 0 }}
      >
        <legend className={styles.sectionLabel}>Kategorien</legend>
        <div className={styles.categories}>
          {CATEGORY_ORDER.map((category) => {
            const active = selectedCategories.includes(category);
            return (
              <label
                key={category}
                className={[styles.categoryChip, active ? styles.categoryChipActive : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleCategory(category)}
                />
                {CATEGORY_LABELS_DE[category]}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
